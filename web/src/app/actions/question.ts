"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import { uploadToImageKit } from "../../lib/imageKit";

// Schema for question data
const questionUpsertSchema = z.object({
  content: z.string(),
  genre: z.string().min(1),
  unlockAt: z.string().optional(),
  draft: z.string().transform((val) => val === "true"), // Transform string to boolean
  previewImageUrl: z.string().optional(),
});

// Validate form data
const validateUpsertFormData = (
  formData: FormData
):
  | { success: true; data: z.infer<typeof questionUpsertSchema> }
  | { success: false; error: string } => {
  const data = {
    content: formData.get("content") as string,
    genre: formData.get("genre") as string,
    draft: formData.get("draft") as string,
    unlockAt: formData.get("unlockAt") as string,
  };

  const validated = questionUpsertSchema.safeParse(data);
  if (!validated.success) {
    return {
      success: false,
      error: `Invalid request: ${validated.error.errors
        .map((err) => `${err.path}: ${err.message}`)
        .join(", ")}`,
    };
  }

  return { success: true, data: validated.data };
};

// Database operation
async function prismaUpsertQuestion(
  data: z.infer<typeof questionUpsertSchema>,
  questionNumber: number | null,
  creatorId: string,
  leagueSlug: string
) {
  const baseData = {
    content: data.content,
    genre: data.genre,
    unlockAt: data.unlockAt,
    draft: data.draft,
    previewImageUrl: data.previewImageUrl,
  };

  // First, get the league to get its ID
  const league = await prisma.league.findUnique({
    where: { slug: leagueSlug },
    select: { id: true, creatorId: true },
  });

  if (!league) {
    throw new Error("League not found");
  }

  // Check if user has permission to modify this league
  if (league.creatorId !== creatorId) {
    throw new Error("Unauthorized to modify questions in this league");
  }

  // Process image uploads
  try {
    const { newContent, imageUrls } = await processImagesInHtmlContent(
      baseData.content,
      questionNumber?.toString() || "1",
      leagueSlug
    );
    baseData.content = newContent;
    if (!baseData.previewImageUrl && imageUrls && imageUrls.length)
      baseData.previewImageUrl = imageUrls[0];
  } catch (error) {
    // Don't do anything, since the image processing failure isn't the end of the world
    // This will re-run the next time the user saves the question
  }

  if (questionNumber) {
    // Update existing question - find by league ID and number
    const existingQuestion = await prisma.question.findFirst({
      where: {
        leagueId: league.id,
        number: questionNumber,
      },
    });

    if (!existingQuestion) {
      throw new Error("Question not found");
    }

    // Check if user created this question
    if (existingQuestion.creatorId !== creatorId) {
      throw new Error("Unauthorized to modify this question");
    }

    return prisma.question.update({
      where: { id: existingQuestion.id },
      data: baseData,
    });
  }

  // Create new question
  return prisma.question.create({
    data: {
      ...baseData,
      creatorId,
      leagueId: league.id,
    },
  });
}

// Schema for question deletion
const questionDeleteSchema = z.object({
  questionId: z.string().min(1),
  leagueSlug: z.string().min(1),
});

// Validate delete form data
const validateDeleteFormData = (
  formData: FormData
):
  | { success: true; data: z.infer<typeof questionDeleteSchema> }
  | { success: false; error: string } => {
  const data = {
    questionId: formData.get("questionId") as string,
    leagueSlug: formData.get("leagueSlug") as string,
  };

  const validated = questionDeleteSchema.safeParse(data);
  if (!validated.success) {
    return {
      success: false,
      error: `Invalid request: ${validated.error.errors
        .map((err) => `${err.path}: ${err.message}`)
        .join(", ")}`,
    };
  }

  return { success: true, data: validated.data };
};

/**
 * Finds all <img> tags in the HTML content whose src is not from imagekit.io,
 * uploads them in parallel to ImageKit, and replaces their URLs in the content.
 * Uses Promise.allSettled for parallel uploads.
 */
export async function processImagesInHtmlContent(
  htmlContent: string,
  questionNumber: string,
  leagueSlug: string
): Promise<{ newContent: string; imageUrls?: string[] }> {
  const imageUrlRegex = /<img[^>]+src="([^"]+)"/g;
  const matches = Array.from(htmlContent.matchAll(imageUrlRegex));
  const urlSet = new Set<string>();

  for (const match of matches) {
    console.log("match", match);
    const url = match[1];
    if (!url.includes("imagekit.io")) {
      urlSet.add(url);
    }
  }

  if (urlSet.size === 0) return { newContent: htmlContent };

  let count = 1;

  const uploadPromises: Promise<{ url: string; type: string }>[] = [];
  urlSet.forEach(async (url) => {
    const fileName = `question-${questionNumber}-${count}-${Date.now()}`;
    count++;

    // Use 'questions' as the default folder
    uploadPromises.push(
      uploadToImageKit(url, fileName, `questions/${leagueSlug}`)
    );
  });
  try {
    const results = await Promise.allSettled(uploadPromises);
    const imageSet: string[] = [];

    let newContent = htmlContent;
    let urlArr = Array.from(urlSet);
    results.forEach((result, idx) => {
      if (result.status === "fulfilled") {
        const originalUrl = urlArr[idx];
        const newUrl = result.value.url;
        imageSet.push(newUrl);
        newContent = newContent.replaceAll(originalUrl, newUrl);
      }
    });

    return { newContent: newContent, imageUrls: imageSet };
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Failed to process image uploads"
    );
  }
}

// Action handler
export async function upsertQuestion(
  formData: FormData,
  leagueSlug: string,
  questionNumber?: string
) {
  const session = await auth();
  if (!session?.user?.id) {
    return { message: "Unauthorized" };
  }

  const validated = validateUpsertFormData(formData);
  if (!validated.success) {
    return { message: validated.error };
  }

  try {
    const question = await prismaUpsertQuestion(
      validated.data,
      questionNumber ? parseInt(questionNumber) : null,
      session.user.id,
      leagueSlug
    );

    revalidatePath(`/league/${leagueSlug}/questions`);
    return {
      message: `Question ${questionNumber ? "updated" : "created"} ${
        validated.data.draft ? "as draft" : ""
      } successfully`,
      id: question.id,
    };
  } catch (error) {
    console.error("Error upserting question:", error);
    return {
      message:
        error instanceof Error
          ? error.message
          : `Failed to ${questionNumber ? "update" : "create"} question`,
    };
  }
}

// Action handler
export async function deleteQuestion(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, message: "Unauthorized" };
  }

  const validated = validateDeleteFormData(formData);
  if (!validated.success) {
    return { success: false, message: validated.error };
  }

  try {
    // First fetch the question to check ownership
    const question = await prisma.question.findUnique({
      where: { id: validated.data.questionId },
      include: { league: true },
    });

    if (!question) {
      return { success: false, message: "Question not found" };
    }

    if (question.creatorId !== session.user.id) {
      return {
        success: false,
        message: "Unauthorized: You can only delete your own questions",
      };
    }

    // Verify the league slug matches (extra security)
    if (question.league.slug !== validated.data.leagueSlug) {
      return {
        success: false,
        message: "Question does not belong to the specified league",
      };
    }

    await prisma.question.delete({
      where: { id: validated.data.questionId },
    });

    revalidatePath(`/league/${validated.data.leagueSlug}/questions`);
    return { success: true, message: "Question deleted successfully" };
  } catch (error) {
    console.error("Failed to delete question:", error);
    return { success: false, message: "Failed to delete question" };
  }
}
