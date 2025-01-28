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
  const [answer, setAnswer] = React.useState(lastSubmission);
  const [answerViewed, setAnswerViewed] = React.useState(false);
  const [answerVisible, setAnswerVisible] = React.useState(false);

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

  const [showIntroModal, setShowIntroModal] = React.useState(true);

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

  const hasChanges = answer !== lastSubmission;

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

      <form
        action={() => {
          return new Promise((resolve, reject) => {
            setTimeout(() => {
              const isCorrect =
                answer.toLowerCase().trim() ===
                correctAnswer?.toLowerCase().trim();
              if (isCorrect) {
                reward();
                setAnswerVisible(true);
              } else {
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
            className="absolute left-1/2 bottom-full"
          />
          <Input
            name="answer"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Enter your answer..."
            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg 
            focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
          />
          <input type="hidden" name="leagueSlug" value={leagueSlug} />
          <input type="hidden" name="number" value={number} />
        </div>

        <div className="flex justify-center gap-4">
          <Tooltip.Provider>
            <Tooltip.Root>
              <Tooltip.Trigger
                render={
                  <LoadingButton
                    disabled={!hasChanges || isAnimating || answerViewed}
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
                    You can submit multiple times - only you can see your
                    submissions!
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
                    disabled={false}
                    type="button"
                    onClick={() => setAnswerVisible(true)}
                    className={`min-w-[100px] h-10 px-4 rounded-lg font-medium`}
                  >
                    View Answer
                  </button>
                }
              />

              <Tooltip.Portal>
                <Tooltip.Positioner>
                  <Tooltip.Popup className="bg-white/10 backdrop-blur-sm text-white p-2 text-xs rounded-lg">
                    You can submit multiple times - only you can see your
                    submissions!
                  </Tooltip.Popup>
                </Tooltip.Positioner>
              </Tooltip.Portal>
            </Tooltip.Root>
          </Tooltip.Provider>
        </div>
      </form>
    </div>
  );
}
