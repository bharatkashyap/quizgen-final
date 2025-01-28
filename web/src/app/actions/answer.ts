"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import ImageKit from "imagekit";

// Initialize ImageKit (do this outside the function to reuse the instance)
const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY!,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT!,
});

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
async function uploadToImageKit(
  file: File,
  leagueSlug: string,
  questionNumber: number
): Promise<{ url: string; type: string }> {
  // Convert File to base64
  const buffer = await file.arrayBuffer();
  const base64 = Buffer.from(buffer).toString("base64");

  const result = await imagekit.upload({
    file: base64,
    fileName: `answer-${questionNumber}-${Date.now()}`,
    folder: `/answers/${leagueSlug}`,
    useUniqueFileName: true,
  });

  return {
    url: result.url,
    type: file.type,
  };
}

// Database operation
async function prismaUpsertAnswer(
  data: ValidatedAnswer,
  leagueSlug: string,
  questionNumber: number,
  creatorId: string
) {
  return prisma.answer.upsert({
    where: {
      leagueSlug_questionNumber: {
        leagueSlug,
        questionNumber,
      },
    },
    create: {
      ...data,
      leagueSlug,
      questionNumber,
      creatorId,
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
    if (file?.size > 0) {
      const { url, type } = await uploadToImageKit(
        file,
        leagueSlug,
        parseInt(questionNumber || "0")
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
