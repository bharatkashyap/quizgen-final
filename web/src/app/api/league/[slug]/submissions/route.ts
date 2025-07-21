import { auth } from "../../../../../lib/auth";
import { prisma } from "../../../../../lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  const session = await auth();

  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { slug } = await params;

  const league = await prisma.league.findUnique({
    where: { slug },
  });

  if (!league) {
    return new NextResponse("League not found", { status: 404 });
  }

  // Get all submissions for this user in this league
  const submissions = await prisma.submission.findMany({
    where: {
      userId: session.user.id,
      question: {
        leagueId: league.id,
      },
    },
    include: {
      question: {
        select: {
          number: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Group by question number and get the latest submission for each
  const submissionsByQuestion = submissions.reduce((acc, submission) => {
    const questionNumber = submission.question.number;
    if (
      !acc[questionNumber] ||
      submission.createdAt > acc[questionNumber].createdAt
    ) {
      acc[questionNumber] = submission;
    }
    return acc;
  }, {} as Record<number, (typeof submissions)[0]>);

  return NextResponse.json(submissionsByQuestion);
}
