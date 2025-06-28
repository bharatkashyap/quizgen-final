import { auth } from "../../../../../../../lib/auth";
import { prisma } from "../../../../../../../lib/prisma";
import { NextResponse } from "next/server";
import { getAnswerUnlockDate, isLocked } from "../../../../../../../lib/utils";

export async function GET(
  request: Request,
  { params }: { params: { slug: string; number: string } }
) {
  const session = await auth();
  const { slug, number } = await params;

  const answer = await prisma.answer.findUnique({
    where: {
      leagueSlug_questionNumber: {
        leagueSlug: slug,
        questionNumber: parseInt(number),
      },
    },
    include: {
      question: {
        include: {
          league: {
            select: {
              unlockMode: true,
              startDate: true,
              timedUnlockInterval: true,
            },
          },
        },
      },
    },
  });

  if (!answer) {
    return new NextResponse("Answer not found", { status: 404 });
  }

  let isUnlocked = false;

  if (answer.question.league.unlockMode === "FREE") {
    isUnlocked = true;
  } else if (answer.question.league.unlockMode === "TIMED") {
    if (!answer.question.league.startDate) {
      return new NextResponse("League start date does not exist", {
        status: 404,
      });
    }

    const unlockDate = getAnswerUnlockDate(
      answer.question.league.startDate,
      parseInt(number),
      answer.question.league.timedUnlockInterval ?? "DAILY",
      answer.question.unlockAt ?? ""
    );

    isUnlocked = !isLocked(unlockDate);
  } else if (answer.question.league.unlockMode === "STEPS") {
    // TODO: Implement LEVELS unlock logic
    isUnlocked = false;
  }

  if (!isUnlocked && !session?.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { question, ...answerData } = answer;
  return NextResponse.json({
    ...answerData,
    isUnlocked,
  });
}
