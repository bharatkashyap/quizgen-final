"use client";
import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "../lib/utils";

const items = [
  {
    title: "Questions",
    segment: "questions",
  },
  {
    title: "Audience",
    segment: "audience",
  },
  {
    title: "Submissions",
    segment: "submissions",
  },
  {
    title: "Leaderboard",
    segment: "leaderboard",
  },
  {
    title: "Settings",
    segment: "settings",
  },
];

export function DashboardNav() {
  const pathname = usePathname();
  const navRef = React.useRef<HTMLDivElement>(null);

  // Get the first segment after the league slug
  const segment = pathname
    .split("/")
    .filter((segment) => items.some((item) => item.segment === segment))[0];

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

  // Get the current league slug from the URL
  const leagueSlug = pathname
    .split("/")
    .find((part, index, array) => array[index - 1] === "league");

  return (
    <div
      ref={navRef}
      className="w-full max-w-screen-xl overflow-x-auto overflow-y-hide"
      style={{ scrollbarWidth: "none" }}
    >
      <nav className="flex px-2">
        {items.map((item) => (
          <Link
            key={item.segment}
            href={`/league/${leagueSlug}/${item.segment}`}
            data-segment={item.segment}
            className={cn(
              "flex items-center justify-center text-sm font-medium transition-all relative px-6 py-2 w-[120px] shrink-0",
              "after:absolute after:bottom-[-1px] after:left-0 after:right-0 after:h-0.5 after:rounded-full after:transition-all after:duration-300",
              segment === item.segment
                ? "text-blue-400 font-semibold after:bg-blue-400"
                : "text-gray-500 dark:text-gray-400 after:bg-transparent hover:text-gray-900 dark:hover:text-gray-200"
            )}
          >
            <span>{item.title}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
