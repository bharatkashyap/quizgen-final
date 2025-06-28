"use client";
import * as React from "react";
import { Plus, Lock } from "lucide-react";
import Link from "next/link";
import { Skeleton } from "./ui/skeleton";
import { useLeague, useQuestions } from "../hooks";
import LeagueNotFound from "./league-not-found";
import { QuestionPreview } from "./question-preview";
import { useSession } from "next-auth/react";
import { IntroModal } from "./intro-modal";
import type { Question } from "../types/question";
import { getQuestionUnlockDate, isLocked, isUnlockedToday } from "../lib/utils";

export function QuestionList({ leagueSlug }: { leagueSlug: string }) {
  const { data: session } = useSession();
  const { data: league } = useLeague(leagueSlug);
  const { data: questions, isLoading } = useQuestions(leagueSlug);
  const [showIntroModal, setShowIntroModal] = React.useState(true);

  const isCreator = React.useMemo(
    () => league?.creatorId === session?.user?.id,
    [league, session]
  );

  React.useEffect(() => {
    if (league?.showIntro) {
      const hasViewedIntro = sessionStorage.getItem(
        `intro-viewed-${leagueSlug}`
      );
      setShowIntroModal(!hasViewedIntro);
    }
  }, [league?.showIntro, leagueSlug, session?.user?.id, league?.creatorId]);

  const handleCloseIntro = () => {
    sessionStorage.setItem(`intro-viewed-${leagueSlug}`, "true");
    setShowIntroModal(false);
  };

  const play = !league?.isPrivate && (!session?.user || !isCreator);

  const getUnlockDate = React.useCallback((question: Question) => {
    if (league?.unlockMode !== "TIMED") return null;
    if (!league?.startDate) return null;

    return getQuestionUnlockDate(
      league.startDate,
      question.number || 1,
      league.timedUnlockInterval || "DAILY",
      question.unlockAt
    );
  }, []);

  if (isLoading) {
    return (
      <div>
        <div className="flex justify-between items-center mb-6 mx-3">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-9 w-28" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mx-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }
  if (!league) {
    return <LeagueNotFound />;
  }
  return (
    <div className="mx-auto">
      {league?.showIntro &&
        league.introContent &&
        showIntroModal &&
        !isCreator && (
          <IntroModal
            content={league.introContent}
            leagueName={league.name}
            onClose={handleCloseIntro}
          />
        )}
      <div className="flex justify-between items-center mb-6 ml-3 mt-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Questions
        </h1>
        {isCreator ? (
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
        ) : null}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {!questions?.length ? (
          <div className="col-start-2 col-end-3 text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {isCreator
                ? "You haven't created any questions yet."
                : "No questions yet"}
            </p>
            {isCreator ? (
              <Link
                href="questions/new"
                className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Create your first question →
              </Link>
            ) : null}
          </div>
        ) : (
          questions?.map((question) => {
            const unlockDate = getUnlockDate(question);
            const locked = isLocked(unlockDate);
            return (
              <div
                key={question.id}
                className={`relative ${
                  isUnlockedToday(unlockDate)
                    ? `
                    ring-2 rounded-lg ring-yellow-400/50 dark:ring-yellow-500/50
                    shadow-[0_0_15px_rgba(250,204,21,0.3)]
                    dark:shadow-[0_0_15px_rgba(234,179,8,0.3)]
                    animate-pulse-subtle
                    scale-[1.02]
                    z-10
                  `
                    : ""
                }`}
              >
                <QuestionPreview
                  play={play}
                  question={question}
                  computedUnlockAt={unlockDate}
                  leagueSlug={leagueSlug}
                  className={`mx-3
                    ${locked ? "blur-[2px] pointer-events-none" : ""}
                    transition-all duration-200
                  `}
                />
                {locked && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 backdrop-blur-[3px] rounded-lg">
                    <Lock className="w-10 h-10 text-white/90 mb-4 drop-shadow-[0_2px_3px_rgba(0,0,0,0.5)]" />
                    <div className="space-y-1.5 text-center">
                      <p className="text-white/80 text-sm font-medium tracking-wide uppercase">
                        Unlocks
                      </p>
                      <p className="font-mono text-2xl text-white font-bold tracking-[0.2em] drop-shadow-[0_2px_3px_rgba(0,0,0,0.5)]">
                        {unlockDate?.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
