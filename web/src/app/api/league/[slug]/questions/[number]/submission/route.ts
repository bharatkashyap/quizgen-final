import { auth } from "../../../../../../../lib/auth";
import { prisma } from "../../../../../../../lib/prisma";
import { NextResponse } from "next/server";
import { getAnswerUnlockDate, isLocked } from "../../../../../../../lib/utils";

export async function GET(
  request: Request,
  { params }: { params: { slug: string; number: string } }
) {
  const session = await auth();

  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  const { slug, number } = await params;

  const league = await prisma.league.findUnique({
    where: { slug },
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
      "No question for the specified league and number found",
      { status: 404 }
    );
  }

  // Find the user's submission for this question
  const submission = await prisma.submission.findFirst({
    where: {
      questionId: question.id,
      userId: session.user.id,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(submission);
}
