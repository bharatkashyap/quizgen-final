"use client";
import { useSession } from "next-auth/react";
import { useLeague } from "../../../../../hooks";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AudiencePage({
  params,
}: {
  params: Promise<{ leagueSlug: string }>;
}) {
  const { data: session } = useSession();
  const router = useRouter();
  const [leagueSlug, setLeagueSlug] = useState<string>("");

  useEffect(() => {
    params.then((p) => setLeagueSlug(p.leagueSlug));
  }, [params]);

  const { data: league } = useLeague(leagueSlug);

  useEffect(() => {
    if (league && session && league.creatorId !== session.user?.id) {
      router.push(`/league/${leagueSlug}/questions`);
    }
  }, [league, session, router, leagueSlug]);

  if (!league || !session || league.creatorId !== session.user?.id) {
    return null;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Audience</h1>
      <p className="text-muted-foreground">Coming soon...</p>
    </div>
  );
}
