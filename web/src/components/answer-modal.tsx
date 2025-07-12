"use client";
import * as React from "react";
import { Trophy } from "lucide-react";
import { signIn, useSession } from "next-auth/react";
import { AnswerPreview } from "./answer-preview";
import { useAnswer } from "../hooks";
import { motion, AnimatePresence } from "framer-motion";
import FireAnimation from "./fire-animation";

export function AnswerModal({
  isCorrect,
  leagueSlug,
  questionNumber,
  onClose,
}: {
  isCorrect: boolean;
  leagueSlug: string;
  questionNumber: string;
  onClose: () => void;
}) {
  const { data: session, status } = useSession();

  React.useEffect(() => {
    const onMount = async () => {
      if (status === "loading") return;
      else {
        if (session) return;
        else {
          await signIn("google", {
            callbackUrl: window.location.pathname + window.location.search,
          });
        }
      }
    };
    onMount();
  }, [session, status]);

  // Animation/sound/haptic effects
  React.useEffect(() => {
    if (isCorrect && session) {
      // Fire: Vibration
      if (navigator.vibrate) navigator.vibrate([80, 30, 80]);
      // Fire: Sound (placeholder)
      const audio = new Audio("/ding.mp3");
      audio.play();
    } else if (!isCorrect && session) {
      // Incorrect: Vibration
      if (navigator.vibrate) navigator.vibrate([40, 20, 40]);
      // Incorrect: Sound (placeholder)
      const audio = new Audio("/sad.mp3");
      audio.play();
    }
  }, [isCorrect, session]);

  const { data: answer, isLoading } = useAnswer(leagueSlug, questionNumber);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <motion.div
        className="bg-gray-950 p-8 rounded-lg max-w-2xl w-full mx-4 relative overflow-hidden"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{
          scale: 1,
          opacity: 1,
          boxShadow: isCorrect
            ? "0 0 80px 20px #ff9800, 0 0 200px 60px #ffd740"
            : "0 0 40px 10px #e57373",
          x: isCorrect ? 0 : [0, -10, 10, -10, 10, 0],
        }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        {/* Animated Fire for correct answer */}
        <AnimatePresence>
          {isCorrect && session && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/3 z-0 pointer-events-none"
              style={{ width: 220, height: 220 }}
            >
              <FireAnimation />
            </motion.div>
          )}
        </AnimatePresence>
        <div className="mb-6 relative z-10">
          {isCorrect ? (
            <motion.h6
              className="text-2xl font-bold text-center mb-4 text-blue-500 flex items-center justify-center gap-2"
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1.2, opacity: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
            >
              <motion.span
                initial={{ rotate: -20 }}
                animate={{
                  rotate: [0, 20, -10, 0],
                  scale: [1, 1.3, 1, 1.1, 1],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  repeatType: "reverse",
                }}
              >
                <Trophy size={32} className="drop-shadow-lg" />
              </motion.span>
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
              >
                Correct!
              </motion.span>
            </motion.h6>
          ) : null}
          {isLoading || !session ? (
            <p className="text-center text-gray-400">Loading...</p>
          ) : !answer ? (
            <p className="text-center text-gray-400">No answer found</p>
          ) : (
            <AnswerPreview
              title={answer.title}
              subtitle={answer.subtitle || ""}
              questionNumber={questionNumber}
              mediaUrl={answer.mediaUrl || ""}
            />
          )}
        </div>
        <button
          onClick={onClose}
          className="w-full mt-6 bg-blue-700 text-gray-100 py-3 rounded-lg font-medium hover:bg-blue-800 transition-colors"
        >
          Close
        </button>
      </motion.div>
    </div>
  );
}
