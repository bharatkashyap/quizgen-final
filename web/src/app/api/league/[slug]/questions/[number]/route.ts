import { auth } from "../../../../../../lib/auth";
import { prisma } from "../../../../../../lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { slug: string; number: string } }
) {
  const session = await auth();
  const { slug, number } = await params;

  const questions = await prisma.question.findUnique({
    where: {
      number: parseInt(number),
      league: {
        slug,
      },
    },
    include: {
      league: true,
    },
  });
  if (questions?.league?.isPrivate && !session?.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  return NextResponse.json(questions);
}
