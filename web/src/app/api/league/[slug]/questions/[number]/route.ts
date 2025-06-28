import { auth } from "../../../../../../lib/auth";
import { prisma } from "../../../../../../lib/prisma";
import { NextResponse } from "next/server";

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
    return new NextResponse("Not found", { status: 404 });
  }

  if (league.isPrivate && !session?.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const questions = await prisma.question.findUnique({
    where: {
      leagueId_number: {
        leagueId: league.id,
        number: parseInt(number),
      },
    },
  });

  return NextResponse.json(questions);
}
