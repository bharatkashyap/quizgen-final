"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";

// Schema for question data
const questionUpsertSchema = z.object({
  content: z.string(),
  genre: z.string().min(1),
  unlockAt: z.string().optional(),
  draft: z.string().transform((val) => val === "true"), // Transform string to boolean
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
  };

  if (questionNumber) {
    // Update existing question
    return prisma.question.update({
      where: {
        leagueSlug_number: {
          leagueSlug,
          number: questionNumber,
        },
      },
      data: baseData,
    });
  }

  // Create new question
  return prisma.question.create({
    data: {
      ...baseData,
      creatorId,
      leagueSlug,
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
    return {
      message: `Failed to ${questionNumber ? "update" : "create"} question`,
    };
  }
}

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
