import Image from "next/image";
import Link from "next/link";
import { CheckCircle, XCircle, Clock, Trophy, Crown } from "lucide-react";
import { cn } from "../lib/utils";
import { type Question } from "../types";
import { GENRE_COLORS } from "../lib/constants";

const PREVIEW_LENGTH = 150;

export function QuestionPreview({
  question,
  computedUnlockAt,
  leagueSlug,
  play,
  className,
  submissionStatus = "none",
}: {
  question: Question;
  computedUnlockAt?: Date | null;
  leagueSlug: string;
  play: boolean;
  className?: string;
  submissionStatus?: "correct" | "incorrect" | "none";
}) {
  // Strip HTML tags and get plain text
  const plainText = question.content.replace(/<[^>]+>/g, "");
  const chipColor = GENRE_COLORS.get(question.genre);

  // Create preview text
  const preview =
    plainText.length > PREVIEW_LENGTH
      ? `${plainText.slice(0, PREVIEW_LENGTH)}...`
      : plainText;

  const formattedDate = computedUnlockAt
    ? computedUnlockAt
        .toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        })
        .toUpperCase()
    : null;

  // Submission status indicator
  const getStatusIndicator = () => {
    switch (submissionStatus) {
      case "correct":
        return (
          // Subtle centered checkmark overlay - barely visible but elegant
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
            <div className="bg-green-500/90 rounded-full p-3 shadow-lg backdrop-blur-sm">
              <div className="flex items-center gap-1">
                <CheckCircle size={24} className="text-white" />
                <span className="text-white text-sm font-bold">1 pt</span>
              </div>
            </div>
          </div>
        );
      case "incorrect":
        return (
          <div className="absolute -top-2 -right-2 z-10">
            <div className="bg-orange-500 rounded-full p-1.5 shadow-lg ring-2 ring-white dark:ring-gray-900">
              <XCircle size={16} className="text-white" />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  // Conquered overlay for correct submissions
  const getConqueredOverlay = () => {
    if (submissionStatus === "correct") {
      return (
        <div className="absolute inset-0 bg-green-500/5 rounded-lg pointer-events-none z-10"></div>
      );
    }
    return null;
  };

  return (
    <div className="relative">
      <Link
        href={`${play ? "/play/" : "/"}league/${leagueSlug}/questions/${
          question.number
        }`}
        className={cn(
          "group block rounded-lg border bg-white/50 dark:bg-gray-900/50",
          "border-gray-200 dark:border-gray-800",
          "hover:border-gray-300 dark:hover:border-gray-700",
          "shadow-sm hover:shadow backdrop-blur-sm",
          "transition-all hover:translate-y-[-1px]",
          "overflow-hidden h-full relative",
          // Elegant conquered styling - subtle but unmistakable
          submissionStatus === "correct" && [
            "opacity-70",
            "grayscale-[0.3]",
            "bg-green-50/40 dark:bg-green-950/20",
            "border-green-200/50 dark:border-green-800/50",
          ],
          // Keep incorrect styling minimal
          submissionStatus === "incorrect" &&
            "border-orange-200/50 dark:border-orange-800/50",
          className
        )}
      >
        {question.previewImageUrl && (
          <div className="relative w-full h-40">
            <Image
              src={question.previewImageUrl}
              priority
              alt=""
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        )}

        <div className="p-4">
          <div className="flex justify-between items-start mb-6">
            <span
              className={cn(
                "text-sm",
                submissionStatus === "correct"
                  ? "text-green-600 dark:text-green-400 font-medium"
                  : "text-gray-500 dark:text-gray-400"
              )}
            >
              #{question.number}
            </span>
            {formattedDate && (
              <span
                className="text-xs font-mono font-semibold tracking-wider px-3 py-1.5 rounded-full
                  bg-gray-900/50 text-gray-200 dark:bg-gray-800/50 dark:text-gray-200
                  ring-1 ring-gray-700/30 dark:ring-gray-600/30
                  backdrop-blur-sm"
              >
                {formattedDate}
              </span>
            )}
            <div className="flex items-center gap-2">
              {question.genre && (
                <span
                  className={`text-xs px-2 py-1 rounded-full                 
                  ${chipColor?.bg || "bg-gray-100"} ${
                    chipColor?.text || "text-grey-600"
                  }`}
                >
                  {question.genre}
                </span>
              )}
            </div>
          </div>

          <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">
            {preview}
          </h3>

          {question.mediaUrl && (
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <span>
                {question.mediaType === "IMAGE" && "📷"}
                {question.mediaType === "AUDIO" && "🎵"}
                {question.mediaType === "VIDEO" && "🎥"}
              </span>
              <span className="group-hover:underline">View attached media</span>
            </div>
          )}
        </div>

        {/* Show subtle checkmark overlay only for correct submissions */}
        {submissionStatus === "correct" && getStatusIndicator()}
      </Link>
    </div>
  );
}
