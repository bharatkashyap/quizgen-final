"use client";
import * as React from "react";
import { X, Trophy } from "lucide-react";
import { AnswerPreview } from "./answer-preview";
import { useAnswer } from "../hooks";

export function AnswerModal({
  leagueSlug,
  questionNumber,
  onClose,
}: {
  leagueSlug: string;
  questionNumber: string;
  onClose: () => void;
}) {
  const { data: answer, isLoading } = useAnswer(leagueSlug, questionNumber);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-950 p-8 rounded-lg max-w-2xl w-full mx-4 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-400"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <div className="w-12 h-12 bg-yellow-600/90 rounded-lg mx-auto mb-4 flex items-center justify-center">
            <Trophy className="w-6 h-6 text-yellow-500" />
          </div>

          {isLoading ? (
            <p className="text-center text-gray-400">Loading...</p>
          ) : !answer ? (
            <p className="text-center text-gray-400">No answer found</p>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-gray-200 mb-4 text-center">
                {answer.title}
              </h2>
              <div className="prose prose-invert prose-p:text-gray-500 prose-headings:text-gray-400 max-w-none text-gray-400 my-6 md:my-12">
                <AnswerPreview
                  title={answer.title}
                  subtitle={answer.subtitle || ""}
                  questionNumber={questionNumber}
                  mediaUrl={answer.mediaUrl || ""}
                />
              </div>
            </>
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
