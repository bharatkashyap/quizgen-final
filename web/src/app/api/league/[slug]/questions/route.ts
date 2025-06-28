import { auth } from "../../../../../lib/auth";
import { prisma } from "../../../../../lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

// Schema for creating questions
const createQuestionSchema = z.object({
  content: z.string().min(1, "Content is required"),
  genre: z.string().min(1, "Genre is required"),
  unlockAt: z.string().optional(),
  draft: z.boolean().default(true),
  mediaUrl: z.string().optional(),
  mediaType: z.string().optional(),
  previewImageUrl: z.string().optional(),
});

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
      leagueId: league.id,
    },
    orderBy: {
      number: "asc",
    },
  });

  return NextResponse.json(questions);
}

export async function POST(
  request: Request,
  { params }: { params: { slug: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const slug = (await params).slug;

  try {
    // Validate request body
    const body = await request.json();
    const validatedData = createQuestionSchema.parse(body);

    // Check if league exists and user has permission
    const league = await prisma.league.findUnique({
      where: { slug },
      select: { id: true, creatorId: true },
    });

    if (!league) {
      return new NextResponse("League not found", { status: 404 });
    }

    if (league.creatorId !== session.user.id) {
      return new NextResponse("Unauthorized to create questions in this league", { 
        status: 403 
      });
    }

    // Create the question
    const question = await prisma.question.create({
      data: {
        ...validatedData,
        creatorId: session.user.id,
        leagueId: league.id,
      },
    });

    return NextResponse.json(question, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: "Validation failed", 
          details: error.errors 
        },
        { status: 400 }
      );
    }

    console.error("Error creating question:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}