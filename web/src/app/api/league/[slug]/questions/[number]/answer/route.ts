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

  const league = await prisma.league.findUnique({
    where: {
      slug,
    },
  });

  if (!league) {
    return new NextResponse("No such league found", { status: 404 });
  }

  const question = await prisma.question.findUnique({
    where: {
      leagueId_number: {
        leagueId: league.id,
        number: parseInt(number),
      },
    },
  });

  if (!question) {
    return new NextResponse(
      "No question for the specified leage and number found",
      { status: 404 }
    );
  }

  let isUnlocked = false;

  switch (league.unlockMode) {
    case "FREE":
      isUnlocked = true;
      break;
    case "TIMED":
      if (!league.startDate) {
        return new NextResponse("League start date does not exist", {
          status: 404,
        });
      }
      const unlockDate = getAnswerUnlockDate(
        league.startDate,
        parseInt(number),
        league.timedUnlockInterval ?? "DAILY",
        question.unlockAt || ""
      );

      isUnlocked = !isLocked(unlockDate);
      break;
    case "STEPS":
      // TODO: Implement LEVELS unlock logic
      isUnlocked = false;
  }

  if (!isUnlocked && !session?.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const answer = await prisma.answer.findUnique({
    where: {
      questionId: question.id,
    },
  });

  if (!answer) {
    return new NextResponse("Answer not found", { status: 404 });
  }

  return NextResponse.json({
    ...answer,
    isUnlocked,
  });
}
