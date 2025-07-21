"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { HelpCircle, Users, FileText, Trophy, Settings } from "lucide-react";
import { useSession } from "next-auth/react";
import { useLeague } from "../hooks";
import { cn } from "../lib/utils";

const items = [
  {
    title: "Questions",
    segment: "questions",
    icon: HelpCircle,
    private: false,
  },
  {
    title: "Audience",
    segment: "audience",
    icon: Users,
    private: true,
  },
  {
    title: "Submissions",
    segment: "submissions",
    icon: FileText,
    private: true,
  },
  {
    title: "Leaderboard",
    segment: "leaderboard",
    icon: Trophy,
    private: false,
  },
  {
    title: "Settings",
    segment: "settings",
    icon: Settings,
    private: true,
  },
];

export function DashboardNav() {
  const pathname = usePathname();
  const navRef = React.useRef<HTMLDivElement>(null);
  const { data: session, status: sessionStatus } = useSession();

  // Get the current league slug from the URL
  const leagueSlug = pathname
    .split("/")
    .find((part, index, array) => array[index - 1] === "league");

  const { data: league, isLoading: leagueLoading } = useLeague(
    leagueSlug || ""
  );

  // Check if current user is the creator
  const isCreator = React.useMemo(
    () => league?.creatorId === session?.user?.id,
    [league, session]
  );

  // Show loading state while we determine auth status
  const isLoading = sessionStatus === "loading" || leagueLoading || !league;

  // Filter items based on privacy and creator status
  const visibleItems = React.useMemo(
    () => items.filter((item) => !item.private || isCreator),
    [isCreator]
  );

  // Get the first segment after the league slug
  const segment = pathname
    .split("/")
    .filter((segment) =>
      visibleItems.some((item) => item.segment === segment)
    )[0];

  // Scroll the clicked item into view
  React.useEffect(() => {
    if (navRef.current && segment) {
      const activeItem = navRef.current.querySelector(
        `[data-segment="${segment}"]`
      );
      activeItem?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, [segment]);

  return (
    <div
      ref={navRef}
      className="w-full max-w-screen-xl overflow-x-auto overflow-y-hide"
      style={{ scrollbarWidth: "none" }}
    >
      <nav className="flex px-2">
        {isLoading ? (
          // Loading placeholder tabs
          <>
            <div className="flex items-center justify-center px-4 py-2 min-w-[140px] shrink-0 gap-2">
              <div className="w-[18px] h-[18px] bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
              <div className="w-16 h-4 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
            </div>
            <div className="flex items-center justify-center px-4 py-2 min-w-[140px] shrink-0 gap-2">
              <div className="w-[18px] h-[18px] bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
              <div className="w-20 h-4 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
            </div>
          </>
        ) : (
          visibleItems.map((item, index) => (
            <Link
              key={`nav-${index}-${item.title}-${Math.random()}`}
              href={`/league/${leagueSlug}/${item.segment}`}
              data-segment={item.segment}
              className={cn(
                "flex items-center justify-center text-sm font-medium transition-all relative px-4 py-2 min-w-[140px] shrink-0 gap-2",
                "after:absolute after:bottom-[-1px] after:left-0 after:right-0 after:h-0.5 after:rounded-full after:transition-all after:duration-300",
                segment === item.segment
                  ? "text-blue-400 font-semibold after:bg-blue-400"
                  : "text-gray-500 dark:text-gray-400 after:bg-transparent hover:text-gray-900 dark:hover:text-gray-200"
              )}
            >
              {<item.icon size={18} />}
              <span className="truncate">{item.title}</span>
            </Link>
          ))
        )}
      </nav>
    </div>
  );
}
