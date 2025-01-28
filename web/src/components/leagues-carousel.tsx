"use client";
import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import LeagueCard from "./league-card";
import { usePublicLeagues } from "../hooks";
import { Skeleton } from "./ui/skeleton";

export default function LeaguesCarousel() {
  const { data: leagues, isLoading } = usePublicLeagues();
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const scrollToIndex = (index: number) => {
    if (containerRef.current && leagues) {
      const maxIndex = Math.max(0, leagues.length - 3); // Show 3 cards at a time
      const newIndex = Math.min(Math.max(0, index), maxIndex);
      setCurrentIndex(newIndex);

      const card = containerRef.current.children[newIndex] as HTMLElement;
      containerRef.current.scrollTo({
        left: card.offsetLeft,
        behavior: "smooth",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4 flex justify-center">
        <div className="flex gap-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-[300px] w-[384px]" />
          ))}
        </div>
      </div>
    );
  }

  if (!leagues?.length) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h1 className="my-3 flex items-center gap-2 text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 justify-center">
        Latest
      </h1>
      <div className="relative mt-8">
        <div
          ref={containerRef}
          className="flex gap-4 overflow-x-hidden scroll-smooth justify-center"
        >
          {leagues.map((league) => (
            <div key={league.id} className="flex-none w-[384px]">
              <LeagueCard league={league} />
            </div>
          ))}
        </div>
      </div>
      {leagues.length > 1 ? (
        <div className="flex justify-center">
          <div className="flex gap-2">
            <button
              onClick={() => scrollToIndex(currentIndex - 1)}
              disabled={currentIndex === 0}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 
              disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scrollToIndex(currentIndex + 1)}
              disabled={currentIndex >= leagues.length - 3}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 
              disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
