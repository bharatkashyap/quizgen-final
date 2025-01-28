import { auth } from "../../../../../../../lib/auth";
import { prisma } from "../../../../../../../lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { slug: string; number: string } }
) {
  const session = await auth();
  const { slug, number } = params;

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
    const startDate = answer.question.league.startDate
      ? new Date(answer.question.league.startDate)
      : null;
    if (!startDate) {
      return new NextResponse("League start date does not exist", {
        status: 404,
      });
    }
    const today = new Date();
    const formattedDate = today.toLocaleDateString("en-CA", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    const currentDate = new Date(formattedDate);
    const diffTime = currentDate.getTime() - startDate.getTime();
    const daysSinceStart = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    isUnlocked = parseInt(number) <= daysSinceStart;
  } else if (answer.question.league.unlockMode === "LEVELS") {
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
