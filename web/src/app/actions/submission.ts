"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import { normalizeText } from "./utils";
import type { Answer } from "../../types/question";

const submissionUpsertSchema = z.object({
  content: z.string().min(1),
  leagueSlug: z.string().min(1),
  questionNumber: z.number().min(1),
  existingSubmissionId: z.string().optional(),
});

const validateUpsertFormData = (
  formData: FormData
):
  | { success: true; data: z.infer<typeof submissionUpsertSchema> }
  | { success: false; error: string } => {
  const data = {
    content: formData.get("content") as string,
    leagueSlug: formData.get("leagueSlug") as string,
    questionNumber: parseInt(formData.get("questionNumber") as string, 10),
    existingSubmissionId: formData.get("existingSubmissionId") as string,
  };

  const validated = submissionUpsertSchema.safeParse(data);
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

async function getAnswer(
  leagueSlug: string,
  questionNumber: number
): Promise<Answer | null> {
  const league = await prisma.league.findUnique({
    where: {
      slug: leagueSlug,
    },
  });
  if (!league) {
    throw new Error("Provided league does not exist");
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
    throw new Error("Provided question does not exist");
  }
  return prisma.answer.findUnique({
    where: {
      leagueId: league.id,
      questionId: question.id,
    },
  });
}

function calculateScore(
  submission: string,
  answer: Pick<Answer, "title" | "subtitle" | "keywords">
): { score: number; isCorrect: boolean } {
  const normalizedSubmission = normalizeText(submission);
  const normalizedTitle = normalizeText(answer.title);

  // Check for exact matches first
  if (normalizedSubmission === normalizedTitle) {
    return { score: 1.0, isCorrect: true };
  }

  console.log(normalizedSubmission, normalizedTitle);

  const submissionWords = new Set(normalizedSubmission.split(" "));

  // Calculate keywords similarity (20% threshold)
  if (answer.keywords) {
    console.log(answer.keywords);
    const keywordsList = answer.keywords
      .split(",")
      .map((k) => normalizeText(k));

    const keywordWords = new Set(keywordsList);
    const intersection = submissionWords.intersection(keywordWords);
    const keywordScore = intersection.size / keywordWords.size;

    console.log(intersection, keywordWords, submissionWords, keywordScore);

    if (keywordScore > 0.2) {
      return {
        score: 1.0,
        isCorrect: true,
      };
    }
  }

  return {
    score: 0,
    isCorrect: false,
  };
}

async function prismaUpsertSubmission(
  data: z.infer<typeof submissionUpsertSchema>,
  answer: Pick<Answer, "id" | "title" | "subtitle" | "keywords" | "questionId">,
  userId: string
) {
  const { score, isCorrect } = calculateScore(data.content, answer);

  if (data.existingSubmissionId) {
    return prisma.submission.update({
      where: { id: data.existingSubmissionId },
      data: {
        content: data.content,
        isCorrect,
        score,
      },
    });
  }

  return prisma.submission.create({
    data: {
      content: data.content,
      score,
      isCorrect,
      answerId: answer.id,
      questionId: answer.questionId,
      userId,
    },
  });
}

export async function setAnswerViewed(
  leagueSlug: string,
  questionNumber: number
) {
  const session = await auth();
  if (!session?.user?.id) {
    return {
      success: false,
      message: "You must be logged in to submit an answer",
    };
  }

  if (!leagueSlug || !questionNumber) {
    return {
      success: false,
      message: "Can not find this question.",
    };
  }

  const answer = await getAnswer(leagueSlug, questionNumber);

  if (!answer) {
    return {
      success: false,
      message: "Can not find the answer to this question.",
    };
  }

  try {
    await prisma.submission.create({
      data: {
        content: "",
        score: 0,
        answerId: answer.id,
        questionId: answer.questionId,
        userId: session.user.id,
        nonCompetitive: true,
      },
    });

    return {
      success: true,
      message: "Answer marked as viewed successfully",
    };
  } catch (error) {
    console.error("Failed to mark answer as viewed:", error);
    return {
      success: false,
      message: "Failed to mark answer as viewed. Please try again later.",
    };
  }
}

export async function upsertSubmission(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    return {
      success: false,
      message: "You must be logged in to submit an answer",
    };
  }

  const validated = validateUpsertFormData(formData);
  if (!validated.success) {
    return { success: false, message: validated.error };
  }

  const answer = await getAnswer(
    validated.data.leagueSlug,
    validated.data.questionNumber
  );

  if (!answer) {
    return {
      success: false,
      message:
        "An error occurred in fetching the answer. Please report this to the developer",
    };
  }

  try {
    const newSubmission = await prismaUpsertSubmission(
      validated.data,
      answer,
      session.user.id
    );

    revalidatePath(
      `/league/${validated.data.leagueSlug}/questions/${validated.data.questionNumber}`
    );

    return {
      success: true,
      message: validated.data.existingSubmissionId
        ? "Answer updated successfully"
        : "Answer submitted successfully",
      id: newSubmission.id,
      score: newSubmission.score,
      isCorrect: newSubmission.score >= 0.8,
    };
  } catch (error) {
    console.error("Failed to submit user answer:", error);
    return {
      success: false,
      message: "Failed to submit answer. Please try again later.",
    };
  }
}
