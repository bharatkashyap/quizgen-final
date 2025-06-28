import { auth } from "../../../../../../lib/auth";
import { prisma } from "../../../../../../lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

// Schema for updating questions
const updateQuestionSchema = z.object({
  content: z.string().min(1, "Content is required").optional(),
  genre: z.string().min(1, "Genre is required").optional(),
  unlockAt: z.string().optional(),
  draft: z.boolean().optional(),
  mediaUrl: z.string().optional(),
  mediaType: z.string().optional(),
  previewImageUrl: z.string().optional(),
});

export async function GET(
  request: Request,
  { params }: { params: { slug: string; number: string } }
) {
  const session = await auth();
  const { slug, number } = await params;

  const question = await prisma.question.findFirst({
    where: {
      number: parseInt(number),
      league: {
        slug,
      },
    },
    include: {
      league: true,
      answer: true,
    },
  });

  if (!question) {
    return new NextResponse("Question not found", { status: 404 });
  }

  if (question.league?.isPrivate && !session?.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  return NextResponse.json(question);
}

export async function PUT(
  request: Request,
  { params }: { params: { slug: string; number: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { slug, number } = await params;

  try {
    // Validate request body
    const body = await request.json();
    const validatedData = updateQuestionSchema.parse(body);

    // Check if question exists and user has permission
    const existingQuestion = await prisma.question.findFirst({
      where: {
        number: parseInt(number),
        league: { slug },
      },
      include: {
        league: true,
      },
    });

    if (!existingQuestion) {
      return new NextResponse("Question not found", { status: 404 });
    }

    if (existingQuestion.creatorId !== session.user.id) {
      return new NextResponse("Unauthorized to update this question", { 
        status: 403 
      });
    }

    // Update the question
    const updatedQuestion = await prisma.question.update({
      where: { id: existingQuestion.id },
      data: validatedData,
    });

    return NextResponse.json(updatedQuestion);
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

    console.error("Error updating question:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { slug: string; number: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { slug, number } = await params;

  try {
    // Check if question exists and user has permission
    const existingQuestion = await prisma.question.findFirst({
      where: {
        number: parseInt(number),
        league: { slug },
      },
      include: {
        league: true,
      },
    });

    if (!existingQuestion) {
      return new NextResponse("Question not found", { status: 404 });
    }

    if (existingQuestion.creatorId !== session.user.id) {
      return new NextResponse("Unauthorized to delete this question", { 
        status: 403 
      });
    }

    // Delete the question (this will cascade to answers due to the schema)
    await prisma.question.delete({
      where: { id: existingQuestion.id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting question:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}