"use client";
import * as React from "react";
import { X, Trophy } from "lucide-react";
import { AnswerPreview } from "./answer-preview";
import { useAnswer } from "../hooks";

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
  const { data: answer, isLoading } = useAnswer(leagueSlug, questionNumber);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-950 p-8 rounded-lg max-w-2xl w-full mx-4 relative">
        <div className="mb-6">
          {isCorrect ? (
            <h6 className="text-2xl font-bold text-center mb-4 text-blue-500 flex items-center justify-center gap-2">
              <Trophy size={24} />
              Correct!
            </h6>
          ) : null}
          {isLoading ? (
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
          className="w-full mt-6 bg-blue-700 text-gray-100 py-3 rounded-lg font-medium
            hover:bg-blue-800 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
}
