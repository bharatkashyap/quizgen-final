import Image from "next/image";
import Link from "next/link";
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
}: {
  question: Question;
  computedUnlockAt?: Date | null;
  leagueSlug: string;
  play: boolean;
  className?: string;
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

  return (
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
        "overflow-hidden",
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
          <span className="text-sm text-gray-500 dark:text-gray-400">
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
    </Link>
  );
}
