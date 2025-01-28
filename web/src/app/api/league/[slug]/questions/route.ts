import { auth } from "../../../../../lib/auth";
import { prisma } from "../../../../../lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  const session = await auth();
  const slug = (await params).slug;
  const league = await prisma.league.findUnique({
    where: {
      slug,
    },
    include: {
      creator: true,
    },
  });

  if (!league) {
    return new NextResponse("League not found", { status: 404 });
  }

  if (
    league.isPrivate &&
    (!session?.user || session.user.id !== league.creatorId)
  ) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const questions = await prisma.question.findMany({
    where: {
      league: {
        slug,
      },
    },
    orderBy: {
      number: "asc",
    },
  });

  return NextResponse.json(questions);
}
