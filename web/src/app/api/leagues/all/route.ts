import { prisma } from "../../../../lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const publicLeagues = await prisma.league.findMany({
      where: {
        isPrivate: false,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        creator: true,
      },
      take: 10, // Limit to 10 most recent/popular leagues
    });

    return NextResponse.json(publicLeagues);
  } catch (error) {
    console.error("Error fetching public leagues:", error);
    return new NextResponse("Error fetching leagues", { status: 500 });
  }
}
