"use client";
import * as React from "react";
import { useParams } from "next/navigation";
import { useLeague, useLeagues } from "../hooks";
import { useSession } from "next-auth/react";
import Link from "next/link";

export function LeagueTitle() {
  const params = useParams();
  const { data: session } = useSession();
  const leagueSlug = params.leagueSlug as string;
  const { data: league, isLoading } = useLeague(leagueSlug);
  const { data: leagues } = useLeagues();

  if (!leagueSlug) return null;

  if (session && leagues?.length !== 0) return null;

  if (isLoading) {
    return (
      <span className="text-2xl font-bold animate-pulse bg-gray-700/50 rounded-lg h-8 w-48 block" />
    );
  }

  return (
    <Link
      href={`/${
        session?.user?.id === league?.creatorId ? "" : "play/"
      }league/${leagueSlug}/questions`}
    >
      <span className="text-sm sm:text-2xl font-bold truncate max-w-[200px] sm:max-w-full bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 hover:from-blue-300 hover:to-purple-300 transition-colors">
        {league?.name}
      </span>
    </Link>
  );
}
