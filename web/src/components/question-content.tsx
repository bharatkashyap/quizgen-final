"use client";
import * as React from "react";
import { useQuestion } from "../hooks";

interface QuestionContentProps {
  leagueSlug?: string;
  number?: string;
  html?: string;
}

// TODO: While animating, show a floating chip button with a fast forward icon that skips to the end and the question is revealed fully

export default function QuestionContent({
  leagueSlug,
  number,
  html,
}: QuestionContentProps) {
  if (!leagueSlug) {
    throw new Error("An unexpected error occurred");
  }

  const shouldFetch = Boolean(!html && leagueSlug && number);

  const { data: question, isLoading } = useQuestion(leagueSlug, number, {
    enabled: shouldFetch,
  });

  const content = shouldFetch ? question?.content : html;

  // Check if this question has been viewed before
  const storageKey = `question-viewed-${leagueSlug}-${number}`;
  const [shouldAnimate, setShouldAnimate] = React.useState(true);
  const [isAnimating, setIsAnimating] = React.useState(false);

  React.useEffect(() => {
    const hasBeenViewed = localStorage.getItem(storageKey);
    if (hasBeenViewed === "true") {
      setShouldAnimate(false);
      setIsAnimating(false);
    }
  }, [leagueSlug, storageKey, number]);

  const skipAnimation = React.useCallback(() => {
    setShouldAnimate(false);
    setIsAnimating(false);
    localStorage.setItem(storageKey, "true");
  }, [storageKey]);

  React.useEffect(() => {
    if (shouldAnimate) {
      setIsAnimating(true);
    } else {
      setIsAnimating(false);
    }
  }, [shouldAnimate]);

  const handleAnimationEnd = React.useCallback(
    (e: React.AnimationEvent) => {
      const root = document.querySelector(".preview-content");
      if (!root) return;

      const animatedElements = root.getElementsByClassName(
        "animate-fade-reveal"
      );
      const lastElement = Array.from(animatedElements).pop();

      if (e.target === lastElement) {
        localStorage.setItem(storageKey, "true");
        setShouldAnimate(false);
        setIsAnimating(false);
      }
    },
    [storageKey]
  );

  const animatedContent = React.useMemo(() => {
    if (!question?.content) return "";
    if (!shouldAnimate) return question.content;

    let elementCount = 0;
    const parts = question.content.split(/(<[^>]*>)/g);

    return parts
      .map((part) => {
        // Handle opening tags for lists and media
        if (part.match(/<(li|img|video|iframe)[^>]*>/i)) {
          const delay = elementCount++ * 250;
          return part.replace(
            />$/,
            ` class="animate-fade-reveal opacity-0" style="animation-delay: ${delay}ms">`
          );
        }

        // Pass through other HTML tags unchanged
        if (part.startsWith("<")) return part;

        // Animate regular text words
        return part
          .split(/(\s+)/)
          .map((word) => {
            if (/^\s+$/.test(word)) return word;
            const delay = elementCount++ * 250;
            return `<span class="animate-fade-reveal opacity-0" style="animation-delay: ${delay}ms">${word}</span>`;
          })
          .join("");
      })
      .join("");
  }, [shouldAnimate, question?.content]);

  if (shouldFetch && isLoading) {
    return (
      <div className="space-y-4 w-full max-w-prose mx-auto">
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-full" />
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-full" />
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-full" />
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-full" />
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-full" />
      </div>
    );
  }

  return (
    <div className="relative">
      {isAnimating && (
        <button
          onClick={skipAnimation}
          className="fixed left-1/2 -translate-x-1/2 bottom-24 bg-white/10 hover:bg-white/20 dark:bg-black/80 dark:hover:bg-black/90 
            text-white dark:text-white rounded-full py-2 px-4 
            border border-white/20 dark:border-white/10
            shadow-[0_0_15px_rgba(255,255,255,0.2)] dark:shadow-[0_0_15px_rgba(255,255,255,0.1)]
            backdrop-blur-sm transition-all duration-200 ease-in-out 
            hover:scale-105 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] 
            dark:hover:shadow-[0_0_20px_rgba(255,255,255,0.2)]
            z-50 flex items-center gap-2 text-sm font-medium"
          aria-label="Skip animation"
        >
          Skip animation
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="5 4 15 12 5 20 5 4" />
            <line x1="19" y1="5" x2="19" y2="19" />
          </svg>
        </button>
      )}
      <div
        dangerouslySetInnerHTML={{
          __html: animatedContent,
        }}
        onAnimationEnd={handleAnimationEnd}
        className="prose dark:prose-invert prose-sm sm:prose-base mx-auto preview-content"
      />
    </div>
  );
}
