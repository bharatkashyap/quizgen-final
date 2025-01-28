import * as React from "react";
import Link from "next/link";
import type { League } from "../types/league";
import { useSession } from "next-auth/react";

interface LeagueCardProps {
  league: League;
}

export default function LeagueCard({ league }: LeagueCardProps) {
  const { data: session } = useSession();

  // Determine the correct route
  const href = React.useMemo(() => {
    // If user is not signed in, go to public route
    if (!session?.user) {
      return `/play/league/${league.slug}/questions`;
    }

    // If user is the creator, go to admin route
    if (session.user.id === league.creatorId) {
      return `/league/${league.slug}/questions`;
    }

    // Otherwise, go to public route
    return `/play/league/${league.slug}/questions`;
  }, [league.slug, league.creatorId, session?.user]);

  return (
    <Link
      href={href}
      className="group flex flex-col overflow-hidden rounded-lg border bg-white/50 dark:bg-gray-900/50
                border-gray-200 dark:border-gray-800
                hover:border-gray-300 dark:hover:border-gray-700
                shadow-sm hover:shadow backdrop-blur-sm
                transition-all hover:translate-y-[-1px]"
    >
      <div className="aspect-video w-full bg-gray-100 dark:bg-gray-800 relative">
        {league.previewImageUrl ? (
          <img
            src={league.previewImageUrl}
            alt={league.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-600">
            No preview image
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {league.isPrivate ? "Private" : "Public"}
          </span>
          <span
            className={
              "text-xs px-2 py-1 rounded-full font-medium bg-purple-500/10 text-purple-600 dark:text-purple-400"
            }
          >
            {league.creator?.name}
          </span>
        </div>
        <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">
          {league.name}
        </h3>
        {league.description && (
          <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
            {league.description}
          </p>
        )}
      </div>
    </Link>
  );
}
