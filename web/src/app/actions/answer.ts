"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import { uploadToImageKit } from "../../lib/imageKit";

// Schema for answer data
const answerSchema = z.object({
  title: z.string().min(1, "Title is required"),
  keywords: z.string().min(1, "Keywords are required"),
  subtitle: z.string().optional(),
  mediaUrl: z.string().optional().nullable(),
  mediaType: z.string().optional().nullable(),
});

type ValidatedAnswer = z.infer<typeof answerSchema>;

// Validate form data
function validateFormData(formData: FormData) {
  try {
    return {
      success: true as const,
      data: answerSchema.parse({
        title: formData.get("title"),
        keywords: formData.get("keywords"),
        subtitle: formData.get("subtitle"),
        mediaUrl: formData.get("mediaUrl"),
        mediaType: formData.get("mediaType"),
      }),
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false as const,
        error: error.errors[0].message,
      };
    }
    return {
      success: false as const,
      error: "Invalid form data",
    };
  }
}

// Handle file upload to ImageKit

// Database operation
async function prismaUpsertAnswer(
  data: ValidatedAnswer,
  leagueSlug: string,
  questionNumber: number,
  creatorId: string
) {
  const league = await prisma.league.findUnique({
    where: {
      slug: leagueSlug,
    },
  });

  if (!league) {
    throw new Error("No league found for the given slug");
  }

  const question = await prisma.question.findUnique({
    where: {
      leagueId_number: {
        leagueId: league.id,
        number: questionNumber,
      },
    },
  });
  if (!question) {
    throw new Error(
      "No question found for the given league and question number"
    );
  }

  return prisma.answer.upsert({
    where: {
      leagueId: league.id,
      questionId: question?.id,
    },
    create: {
      ...data,
      creator: {
        connect: {
          id: creatorId,
        },
      },
      question: {
        connect: {
          id: question.id,
        },
      },
      league: {
        connect: {
          id: league.id,
        },
      },
    },
    update: data,
  });
}

// Main action handler
export async function upsertAnswer(
  formData: FormData,
  leagueSlug: string,
  questionNumber: string | undefined
) {
  const session = await auth();
  if (!session?.user?.id) {
    return { message: "Unauthorized" };
  }

  // Validate form data
  const validated = validateFormData(formData);
  if (!validated.success) {
    return { message: validated.error };
  }

  try {
    let { data } = validated;

    // Handle file upload if present
    const file = formData.get("file") as File;

    // TODO: De-duplicate file uploads

    if (file?.size > 0) {
      const { url, type } = await uploadToImageKit(
        file,
        `answer-${questionNumber}-${Date.now()}`,
        `answer/${leagueSlug}`
      );
      data = {
        ...data,
        mediaUrl: url,
        mediaType: type.startsWith("image/") ? "IMAGE" : undefined,
      };
    }

    // Create or update answer
    const answer = await prismaUpsertAnswer(
      data,
      leagueSlug,
      parseInt(questionNumber || "0"),
      session.user.id
    );
    revalidatePath(`/league/${leagueSlug}/questions/${questionNumber}/answer`);
    return { id: answer.id };
  } catch (error) {
    console.error("Error upserting answer:", error);
    return { message: "Failed to save answer" };
  }
}
