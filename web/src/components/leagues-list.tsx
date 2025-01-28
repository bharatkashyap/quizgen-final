"use client";
import * as React from "react";
import { Plus } from "lucide-react";
import Link from "next/link";
import { usePublicLeagues, useLeagues } from "../hooks";
import { Skeleton } from "./ui/skeleton";
import LeagueCard from "./league-card";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export function LeagueList() {
  const { data: leagues } = useLeagues();
  const { data: publicLeagues, isLoading } = usePublicLeagues();
  const { data: session } = useSession();
  const router = useRouter();

  const handleCreateLeague = async () => {
    if (!session) {
      await signIn("google", { callbackUrl: "/league/new" });
      return;
    }

    router.push("/league/new");
  };

  if (isLoading) {
    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-9 w-28" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-[240px] w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Leagues
        </h1>
        <button
          onClick={handleCreateLeague}
          className="flex items-center h-9 px-4 transition-all
            bg-gradient-to-r from-blue-500 to-purple-500 
            hover:from-blue-600 hover:to-purple-600
            text-white font-medium rounded-md shadow-lg
            hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create New
        </button>
      </div>

      {!session?.user && publicLeagues?.length ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {publicLeagues.map((league) => (
            <LeagueCard key={league.id} league={league} />
          ))}
        </div>
      ) : null}

      {session?.user && !leagues?.length ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            You haven't created any leagues yet.
          </p>
          <Link
            href="/league/new"
            className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Create your first league →
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {leagues?.map((league) => (
            <LeagueCard key={league.id} league={league} />
          ))}
        </div>
      )}
    </div>
  );
}
