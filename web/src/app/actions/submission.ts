"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";

// Schema for submission data
const submissionSchema = z.object({
  content: z.string().min(1, "Answer content is required"),
  questionId: z.string().min(1, "Question ID is required"),
  leagueSlug: z.string().min(1, "League slug is required"),
});

// Validate form data
function validateSubmissionData(formData: FormData) {
  try {
    return {
      success: true as const,
      data: submissionSchema.parse({
        content: formData.get("content"),
        questionId: formData.get("questionId"),
        leagueSlug: formData.get("leagueSlug"),
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

// Calculate score based on answer keywords
function calculateScore(submission: string, keywords: string): number {
  const submissionWords = submission.toLowerCase().trim().split(/\s+/);
  const keywordList = keywords.toLowerCase().split(',').map(k => k.trim());
  
  let matches = 0;
  for (const keyword of keywordList) {
    if (submissionWords.some(word => word.includes(keyword) || keyword.includes(word))) {
      matches++;
    }
  }
  
  return Math.min((matches / keywordList.length) * 100, 100);
}

// Database operations
async function getQuestionWithAnswer(questionId: string, userId: string) {
  const question = await prisma.question.findUnique({
    where: { id: questionId },
    include: {
      answer: true,
      league: true,
    },
  });

  if (!question) {
    throw new Error("Question not found");
  }

  if (!question.answer) {
    throw new Error("No answer available for this question");
  }

  // Check if user already submitted for this question
  const existingSubmission = await prisma.submission.findUnique({
    where: {
      userId_questionId: {
        userId,
        questionId,
      },
    },
  });

  return { question, existingSubmission };
}

async function createOrUpdateSubmission(
  data: z.infer<typeof submissionSchema>,
  userId: string,
  score: number,
  isCorrect: boolean,
  answerId: string,
  existingSubmission?: any
) {
  if (existingSubmission) {
    return prisma.submission.update({
      where: { id: existingSubmission.id },
      data: {
        content: data.content,
        score,
        isCorrect,
      },
    });
  }

  return prisma.submission.create({
    data: {
      content: data.content,
      score,
      isCorrect,
      userId,
      questionId: data.questionId,
      answerId,
    },
  });
}

// Main action handler
export async function submitAnswer(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, message: "Unauthorized" };
  }

  // Validate form data
  const validated = validateSubmissionData(formData);
  if (!validated.success) {
    return { success: false, message: validated.error };
  }

  try {
    const { data } = validated;
    
    // Get question with answer and check existing submission
    const { question, existingSubmission } = await getQuestionWithAnswer(
      data.questionId,
      session.user.id
    );

    // Calculate score
    const score = calculateScore(data.content, question.answer!.keywords);
    const isCorrect = score >= 80; // Consider 80% or higher as correct

    // Create or update submission
    const submission = await createOrUpdateSubmission(
      data,
      session.user.id,
      score,
      isCorrect,
      question.answer!.id,
      existingSubmission
    );

    // Revalidate relevant paths
    revalidatePath(`/play/league/${data.leagueSlug}/questions/${question.number}`);
    revalidatePath(`/league/${data.leagueSlug}/questions/${question.number}/submissions`);

    return {
      success: true,
      message: existingSubmission ? "Answer updated successfully" : "Answer submitted successfully",
      submission: {
        id: submission.id,
        score: submission.score,
        isCorrect: submission.isCorrect,
        content: submission.content,
      },
    };
  } catch (error) {
    console.error("Error submitting answer:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to submit answer",
    };
  }
}

// Get user's submission for a question
export async function getUserSubmission(questionId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }

  try {
    const submission = await prisma.submission.findUnique({
      where: {
        userId_questionId: {
          userId: session.user.id,
          questionId,
        },
      },
    });

    return submission;
  } catch (error) {
    console.error("Error getting user submission:", error);
    return null;
  }
}