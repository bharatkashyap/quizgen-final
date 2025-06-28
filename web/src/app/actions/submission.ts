"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import { normalizeText } from "./utils";
import type { Answer } from "../../types/question";

const userAnswerUpsertSchema = z.object({
  submission: z.string().min(1),
  leagueSlug: z.string().min(1),
  questionNumber: z.number().min(1),
});

const validateUpsertFormData = (
  formData: FormData
):
  | { success: true; data: z.infer<typeof userAnswerUpsertSchema> }
  | { success: false; error: string } => {
  const data = {
    submission: formData.get("submission") as string,
    leagueSlug: formData.get("leagueSlug") as string,
    questionNumber: parseInt(formData.get("questionNumber") as string, 10),
  };

  const validated = userAnswerUpsertSchema.safeParse(data);
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
  return prisma.answer.findUnique({
    where: {
      leagueSlug_questionNumber: {
        leagueSlug,
        questionNumber,
      },
    },
  });
}

async function checkEligibility(
  userId: string,
  leagueSlug: string,
  questionNumber: number
) {
  const answer = await getAnswer(leagueSlug, questionNumber);
  if (!answer) {
    return {
      eligible: false,
      reason: "This question does not exist in this league",
    };
  }

  // Check if user has already viewed the answer
  const viewedAnswer = await prisma.viewedAnswer.findUnique({
    where: {
      userId_answerId: {
        userId,
        answerId: answer.id,
      },
    },
  });

  // Check if user has already submitted an answer (but we'll allow updates)
  const existingSubmission = await prisma.userAnswer.findFirst({
    where: {
      userId,
      answerId: answer.id,
    },
  });

  return {
    eligible: !viewedAnswer, // Only viewedAnswer makes user ineligible
    reason: viewedAnswer
      ? "You cannot submit an answer because you have already viewed the solution"
      : null,
    answer,
    existingSubmission,
  };
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

  // Calculate title similarity (50% weight)
  const titleWords = new Set(normalizedTitle.split(" "));
  const submissionWords = new Set(normalizedSubmission.split(" "));
  const titleIntersection = new Set(
    Array.from(submissionWords).filter((x) => titleWords.has(x))
  );
  const titleUnion = new Set([
    ...Array.from(submissionWords),
    ...Array.from(titleWords),
  ]);
  const titleSimilarity = titleIntersection.size / titleUnion.size;

  let weightedScore = titleSimilarity;

  // Calculate keywords similarity (20% weight)
  if (answer.keywords) {
    const keywordsList = answer.keywords
      .split(",")
      .map((k) => normalizeText(k));
    const keywordScores = keywordsList.map((keyword) => {
      const keywordWords = new Set(keyword.split(" "));
      const intersection = new Set(
        Array.from(submissionWords).filter((x) => keywordWords.has(x))
      );
      const union = new Set([
        ...Array.from(submissionWords),
        ...Array.from(keywordWords),
      ]);
      return intersection.size / union.size;
    });
    const bestKeywordScore = Math.max(0, ...keywordScores);

    // Calculate weighted score
    weightedScore = titleSimilarity * 0.5 + bestKeywordScore * 0.5;
  }

  return {
    score: weightedScore,
    isCorrect: weightedScore >= 0.8,
  };
}

async function prismaUpsertUserAnswer(
  data: z.infer<typeof userAnswerUpsertSchema>,
  answer: Pick<Answer, "id" | "title" | "subtitle" | "keywords">,
  userId: string,
  existingSubmission: { id: string } | null
) {
  const { score, isCorrect } = calculateScore(data.submission, answer);

  if (existingSubmission) {
    return prisma.userAnswer.update({
      where: { id: existingSubmission.id },
      data: {
        submission: data.submission,
        score,
      },
    });
  }

  return prisma.userAnswer.create({
    data: {
      submission: data.submission,
      score,
      answerId: answer.id,
      userId,
    },
  });
}

export async function upsertUserAnswer(formData: FormData) {
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

  const { eligible, reason, answer, existingSubmission } =
    await checkEligibility(
      session.user.id,
      validated.data.leagueSlug,
      validated.data.questionNumber
    );

  if (!eligible || !answer) {
    return {
      success: false,
      message:
        reason || "You are not eligible to submit an answer for this question",
    };
  }

  try {
    const userAnswer = await prismaUpsertUserAnswer(
      validated.data,
      answer,
      session.user.id,
      existingSubmission
    );

    revalidatePath(`/league/${validated.data.leagueSlug}/questions`);

    return {
      success: true,
      message: existingSubmission
        ? "Answer updated successfully"
        : "Answer submitted successfully",
      id: userAnswer.id,
      score: userAnswer.score,
      isCorrect: userAnswer.score >= 0.8,
    };
  } catch (error) {
    console.error("Failed to submit user answer:", error);
    return {
      success: false,
      message: "Failed to submit answer. Please try again later.",
    };
  }
}
