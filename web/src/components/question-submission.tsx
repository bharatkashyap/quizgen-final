"use client";
import * as React from "react";
import { Lock } from "lucide-react";
import { useReward } from "react-rewards";
import { useLeague } from "../hooks";
import { Input } from "@base-ui-components/react/input";
import { Dialog } from "@base-ui-components/react/dialog";
import { Tooltip } from "@base-ui-components/react/tooltip";
// import { submitAnswer } from "../actions/submit-answer";
import { LoadingButton } from "./ui/loading-button";
import { useSession } from "next-auth/react";
import { IntroModal } from "./intro-modal";
import { AnswerModal } from "./answer-modal";

interface QuestionSubmissionProps {
  leagueSlug: string;
  number: string;
  isLocked?: boolean;
  lastSubmission?: string;
  correctAnswer?: string;
  unlockTime?: string; // ISO string for timed leagues
}

export default function QuestionSubmission({
  leagueSlug,
  number,
  isLocked = false,
  lastSubmission = "",
  correctAnswer,
  unlockTime,
}: QuestionSubmissionProps) {
  const { data: session } = useSession();
  const { data: league } = useLeague(leagueSlug);
  const [submission, setSubmission] = React.useState(lastSubmission);
  const [answerViewed, setAnswerViewed] = React.useState(false);
  const [answerVisible, setAnswerVisible] = React.useState(false);
  const [isCorrect, setIsCorrect] = React.useState(false);

  React.useEffect(() => {
    const localStorageState = localStorage.getItem(
      `answer-viewed-${leagueSlug}-${number}`
    );
    if (localStorageState && JSON.parse(localStorageState)) {
      setAnswerViewed(JSON.parse(localStorageState));
    }
  }, []);

  React.useEffect(() => {
    if (answerVisible) {
      setAnswerViewed(true);
      localStorage.setItem(`answer-viewed-${leagueSlug}-${number}`, "true");
      if (session?.user.id) {
        // TODO: Mark answer viewed on the server, disallow future submissions for this question
      }
    }
  }, [answerVisible]);

  const { reward, isAnimating } = useReward(
    `reward-${leagueSlug}-${number}`,
    "confetti",
    {
      elementCount: 200,
      spread: 120,
      angle: 90,
      startVelocity: 45,
      decay: 0.91,
      lifetime: 250,
      colors: ["#F7B801", "#F18701", "#F35B04", "#F5F770", "#72F753"],
    }
  );

  const isCreator = React.useMemo(
    () => league?.creatorId === session?.user?.id,
    [league, session]
  );

  const [showIntroModal, setShowIntroModal] = React.useState(true);
  const [showAnswerWarning, setShowAnswerWarning] = React.useState(false);

  const handleCloseIntro = () => {
    sessionStorage.setItem(`intro-viewed-${leagueSlug}`, "true");
    setShowIntroModal(false);
  };

  const handleViewAnswer = () => {
    const hasSeenWarning = localStorage.getItem(
      `answer-warning-seen-${leagueSlug}`
    );
    if (!hasSeenWarning) {
      setShowAnswerWarning(true);
    } else {
      setAnswerVisible(true);
    }
  };

  const handleConfirmViewAnswer = () => {
    localStorage.setItem(`answer-warning-seen-${leagueSlug}`, "true");
    setShowAnswerWarning(false);
    setAnswerVisible(true);
  };

  React.useEffect(() => {
    if (league?.showIntro) {
      const hasViewedIntro = sessionStorage.getItem(
        `intro-viewed-${leagueSlug}`
      );
      setShowIntroModal(!hasViewedIntro);
    }
  }, [league?.showIntro, leagueSlug, session?.user?.id, league?.creatorId]);

  const hasChanges = submission !== lastSubmission;

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

      {showAnswerWarning && (
        <Dialog.Root
          open={showAnswerWarning}
          onOpenChange={setShowAnswerWarning}
        >
          <Dialog.Portal>
            <Dialog.Backdrop className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
            <Dialog.Popup className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/90 border border-white/10 p-6 rounded-lg max-w-md">
              <Dialog.Title className="text-lg font-semibold mb-4">
                Careful!
              </Dialog.Title>
              <Dialog.Description className="text-sm text-white/80 mb-6">
                After viewing the answer, any future submissions for this
                question will not count towards your leaderboard score.
              </Dialog.Description>
              <div className="flex justify-end gap-3">
                <Dialog.Close className="px-4 py-2 text-sm rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
                  Cancel
                </Dialog.Close>
                <button
                  onClick={handleConfirmViewAnswer}
                  className="px-4 py-2 text-sm rounded-lg bg-yellow-500 hover:bg-yellow-600 text-black transition-colors"
                >
                  View Answer
                </button>
              </div>
            </Dialog.Popup>
          </Dialog.Portal>
        </Dialog.Root>
      )}

      {answerVisible && (
        <AnswerModal
          isCorrect={isCorrect}
          leagueSlug={leagueSlug}
          questionNumber={number}
          onClose={() => setAnswerVisible(false)}
        />
      )}

      <form
        action={() => {
          return new Promise((resolve, reject) => {
            setTimeout(() => {
              const isCorrect =
                submission.toLowerCase().trim() ===
                correctAnswer?.toLowerCase().trim();
              setIsCorrect(isCorrect);
              if (isCorrect) {
                reward();
                setAnswerVisible(true);
              }
              resolve();
            }, 1000);
          });
        }}
        className="mt-8 space-y-6"
      >
        <div className="max-w-xl mx-auto w-full relative">
          <span
            id={`reward-${leagueSlug}-${number}`}
            className="absolute left-1/2 bottom-full z-50"
          />
          <Input
            name="submission"
            value={submission}
            onChange={(e) => setSubmission(e.target.value)}
            placeholder="Enter your answer..."
            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg 
            focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
          />
          <input type="hidden" name="leagueSlug" value={leagueSlug} />
          <input type="hidden" name="number" value={number} />
          <input
            type="hidden"
            name="answerViewed"
            value={JSON.stringify(answerViewed)}
          />
        </div>

        <div className="flex justify-center gap-4">
          <Tooltip.Provider>
            <Tooltip.Root>
              <Tooltip.Trigger
                render={
                  <LoadingButton
                    disabled={!hasChanges || isAnimating}
                    className={`min-w-[100px] h-10 px-4 rounded-lg font-medium
                  ${
                    hasChanges && !isAnimating
                      ? "bg-yellow-500 hover:bg-yellow-600 text-black"
                      : "bg-white/5 text-white/50 cursor-not-allowed"
                  } transition-colors`}
                  >
                    Submit
                  </LoadingButton>
                }
              />

              <Tooltip.Portal>
                <Tooltip.Positioner>
                  <Tooltip.Popup className="bg-white/10 backdrop-blur-sm text-white p-2 text-xs rounded-lg">
                    You can submit multiple times and your submissions are
                    private!
                  </Tooltip.Popup>
                </Tooltip.Positioner>
              </Tooltip.Portal>
            </Tooltip.Root>
          </Tooltip.Provider>
          <button
            type="button"
            onClick={handleViewAnswer}
            className={`min-w-[100px] h-10 px-4 rounded-lg font-medium
              border border-yellow-500 text-yellow-500 
              hover:border-yellow-600 hover:text-yellow-600
              transition-colors`}
          >
            View Answer
          </button>
        </div>
      </form>
    </div>
  );
}
