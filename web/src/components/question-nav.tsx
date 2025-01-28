"use client";

import * as React from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "../lib/utils";

const items = [
  {
    title: "Edit",
    segment: "",
  },
  {
    title: "Answer",
    segment: "answer",
  },
  {
    title: "Submissions",
    segment: "submissions",
  },
];

interface QuestionNavProps {
  number?: string;
  leagueSlug: string;
}

export default function QuestionNav({ number, leagueSlug }: QuestionNavProps) {
  const pathname = usePathname();
  const navRef = React.useRef<HTMLDivElement>(null);

  // Get the last segment of the URL
  const segment = pathname.split("/").pop();

  // Calculate the path to be navigated to
  const createPath = React.useCallback((itemSegment: string) => {
    if (!number) {
      if (!itemSegment) {
        return `/league/${leagueSlug}/questions/new`;
      } else {
        return `/league/${leagueSlug}/questions/new/${itemSegment}`;
      }
    } else {
      if (!itemSegment) {
        return `/league/${leagueSlug}/questions/${number}`;
      }
      return `/league/${leagueSlug}/questions/${number}/${itemSegment}`;
    }
  }, []);

  // Check if segment is selected
  const isSelected = React.useCallback((itemSegment: string) => {
    if (segment === itemSegment) {
      return true;
    }
    if (!itemSegment) {
      // Deal with "edit cases"
      if (number) {
        if (segment === number) return true;
      } else {
        if (segment === "new") return true;
      }
    }

    return false;
  }, []);

  return (
    <div className="mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold mb-3">
          {number ? `Question #${number}` : "New Question"}
        </h1>

        <Link
          href={`/league/${leagueSlug}/questions/new`}
          className="flex items-center h-9 px-4 transition-all
              bg-gradient-to-r from-blue-500 to-purple-500 
              hover:from-blue-600 hover:to-purple-600
              text-white font-medium rounded-md shadow-lg
              hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create New
        </Link>
      </div>
      <div
        ref={navRef}
        className="w-full overflow-x-auto overflow-y-hide mb-4"
        style={{ scrollbarWidth: "none" }}
      >
        <nav className="flex justify-center">
          {items.map((item) => (
            <Link
              key={item.segment}
              href={createPath(item.segment)}
              className={cn(
                "px-4 py-2 text-sm font-medium border-b-2",
                isSelected(item.segment)
                  ? "text-blue-600 border-blue-600"
                  : "text-gray-600 dark:text-gray-400 border-transparent hover:text-gray-900 dark:hover:text-gray-300"
              )}
            >
              <span>{item.title}</span>
            </Link>
          ))}
        </nav>
      </div>

      {/* Content will be rendered by the page components */}
    </div>
  );
}
