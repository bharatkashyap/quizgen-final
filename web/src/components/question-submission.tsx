"use client";
import * as React from "react";
import { Lock } from "lucide-react";
import { useReward } from "react-rewards";
import { useLeague, useQuestion, useUserSubmission } from "../hooks";
import { useSubmitAnswer } from "../hooks/useSubmission";
import { Input } from "@base-ui-components/react/input";
import { Tooltip } from "@base-ui-components/react/tooltip";
import { LoadingButton } from "./ui/loading-button";
import { useSession } from "next-auth/react";
import { IntroModal } from "./intro-modal";
import { AnswerModal } from "./answer-modal";

interface QuestionSubmissionProps {
  leagueSlug: string;
  number: string;
  isLocked?: boolean;
  unlockTime?: string; // ISO string for timed leagues
}

export default function QuestionSubmission({
  leagueSlug,
  number,
  isLocked = false,
  unlockTime,
}: QuestionSubmissionProps) {
  const { data: session } = useSession();
  const { data: league } = useLeague(leagueSlug);
  const { data: question } = useQuestion(leagueSlug, number);
  const { data: userSubmission } = useUserSubmission(question?.id || "");
  const submitAnswerMutation = useSubmitAnswer();
  
  const [answer, setAnswer] = React.useState("");
  const [answerViewed, setAnswerViewed] = React.useState(false);
  const [answerVisible, setAnswerVisible] = React.useState(false);
  const [showIntroModal, setShowIntroModal] = React.useState(true);

  // Initialize answer from existing submission
  React.useEffect(() => {
    if (userSubmission) {
      setAnswer(userSubmission.content);
    }
  }, [userSubmission]);

  React.useEffect(() => {
    const localStorageState = localStorage.getItem(
      `answer-viewed-${leagueSlug}-${number}`
    );
    if (localStorageState && JSON.parse(localStorageState)) {
      setAnswerViewed(JSON.parse(localStorageState));
    }
  }, [leagueSlug, number]);

  React.useEffect(() => {
    if (answerVisible) {
      setAnswerViewed(true);
      localStorage.setItem(`answer-viewed-${leagueSlug}-${number}`, "true");
    }
  }, [answerVisible, leagueSlug, number]);

  const { reward, isAnimating } = useReward(
    `reward-${leagueSlug}-${number}`,
    "confetti",
    {
      elementCount: 100,
      spread: 70,
      startVelocity: 30,
      decay: 0.95,
      lifetime: 200,
      colors: ["#F7B801", "#F18701", "#F35B04", "#F5F770", "#72F753"],
    }
  );

  const isCreator = React.useMemo(
    () => league?.creatorId === session?.user?.id,
    [league, session]
  );

  const handleCloseIntro = () => {
    sessionStorage.setItem(`intro-viewed-${leagueSlug}`, "true");
    setShowIntroModal(false);
  };

  React.useEffect(() => {
    if (league?.showIntro) {
      const hasViewedIntro = sessionStorage.getItem(
        `intro-viewed-${leagueSlug}`
      );
      setShowIntroModal(!hasViewedIntro);
    }
  }, [league?.showIntro, leagueSlug, session?.user?.id, league?.creatorId]);

  const hasChanges = answer !== (userSubmission?.content || "");

  const handleSubmit = async (formData: FormData) => {
    if (!question?.id) return;

    // Add required fields to form data
    formData.set("questionId", question.id);
    formData.set("leagueSlug", leagueSlug);

    try {
      const result = await submitAnswerMutation.mutateAsync(formData);
      
      // Show confetti if answer is correct
      if (result.submission?.isCorrect) {
        reward();
        setTimeout(() => {
          setAnswerVisible(true);
        }, 1000);
      }
    } catch (error) {
      // Error is handled by the mutation's onError callback
    }
  };

  if (!question) {
    return (
      <div className="mt-8 text-center text-gray-500 dark:text-gray-400">
        Loading question...
      </div>
    );
  }

  return (
    <div>
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

      {answerVisible && (
        <AnswerModal
          leagueSlug={leagueSlug}
          questionNumber={number}
          onClose={() => setAnswerVisible(false)}
        />
      )}

      {isLocked && (
        <div className="mt-8 text-center">
          <Lock className="w-8 h-8 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-400">
            This question is locked.
            {unlockTime && (
              <span className="block text-sm mt-2">
                Unlocks: {new Date(unlockTime).toLocaleString()}
              </span>
            )}
          </p>
        </div>
      )}

      {!isLocked && (
        <form action={handleSubmit} className="mt-8 space-y-6">
          <div className="max-w-xl mx-auto w-full relative">
            <span
              id={`reward-${leagueSlug}-${number}`}
              className="absolute left-1/2 bottom-full"
            />
            <Input
              name="content"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Enter your answer..."
              disabled={answerViewed || submitAnswerMutation.isPending}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg 
              focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent
              disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          {userSubmission && (
            <div className="max-w-xl mx-auto text-center">
              <div className="text-sm text-gray-400 mb-2">
                Previous submission score: {Math.round(userSubmission.score)}%
                {userSubmission.isCorrect && (
                  <span className="text-green-400 ml-2">✓ Correct!</span>
                )}
              </div>
            </div>
          )}

          <div className="flex justify-center gap-4">
            <Tooltip.Provider>
              <Tooltip.Root>
                <Tooltip.Trigger
                  render={
                    <LoadingButton
                      disabled={
                        !hasChanges || 
                        isAnimating || 
                        answerViewed || 
                        !answer.trim() ||
                        submitAnswerMutation.isPending
                      }
                      loading={submitAnswerMutation.isPending}
                      loadingText="Submitting..."
                      className={`min-w-[100px] h-10 px-4 rounded-lg font-medium
                    ${
                      hasChanges && !isAnimating && answer.trim()
                        ? "bg-yellow-500 hover:bg-yellow-600 text-black"
                        : "bg-white/5 text-white/50 cursor-not-allowed"
                    } transition-colors`}
                    >
                      {userSubmission ? "Update Answer" : "Submit Answer"}
                    </LoadingButton>
                  }
                />

                <Tooltip.Portal>
                  <Tooltip.Positioner>
                    <Tooltip.Popup className="bg-white/10 backdrop-blur-sm text-white p-2 text-xs rounded-lg">
                      {userSubmission 
                        ? "You can update your submission multiple times"
                        : "You can submit multiple times - only you can see your submissions!"
                      }
                    </Tooltip.Popup>
                  </Tooltip.Positioner>
                </Tooltip.Portal>
              </Tooltip.Root>
            </Tooltip.Provider>

            <Tooltip.Provider>
              <Tooltip.Root>
                <Tooltip.Trigger
                  render={
                    <button
                      disabled={answerViewed}
                      type="button"
                      onClick={() => setAnswerVisible(true)}
                      className={`min-w-[100px] h-10 px-4 rounded-lg font-medium
                      ${
                        !answerViewed
                          ? "bg-blue-500 hover:bg-blue-600 text-white"
                          : "bg-white/5 text-white/50 cursor-not-allowed"
                      } transition-colors`}
                    >
                      View Answer
                    </button>
                  }
                />

                <Tooltip.Portal>
                  <Tooltip.Positioner>
                    <Tooltip.Popup className="bg-white/10 backdrop-blur-sm text-white p-2 text-xs rounded-lg">
                      {answerViewed 
                        ? "You've already viewed the answer"
                        : "View the correct answer (this will prevent future submissions)"
                      }
                    </Tooltip.Popup>
                  </Tooltip.Positioner>
                </Tooltip.Portal>
              </Tooltip.Root>
            </Tooltip.Provider>
          </div>
        </form>
      )}
    </div>
  );
}