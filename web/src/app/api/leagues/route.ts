import { auth } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";
import type { LeaguesResponse } from "../../../types/league";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const [createdLeagues, subscriptions] = await Promise.all([
    prisma.league.findMany({
      where: { creatorId: session.user.id },
    }),
    prisma.leagueSubscription.findMany({
      where: { userId: session.user.id },
      include: { league: true },
    }),
  ]);

  const subscribedLeagues = subscriptions.map((sub) => sub.league);
  const allLeagues: LeaguesResponse = [...createdLeagues, ...subscribedLeagues];

  return NextResponse.json(allLeagues);
}
