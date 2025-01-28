"use client";
import * as React from "react";
import { useQuestion } from "../hooks";

interface QuestionContentProps {
  leagueSlug?: string;
  number?: string;
  html?: string;
}

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

  React.useEffect(() => {
    const hasBeenViewed = localStorage.getItem(storageKey);
    if (hasBeenViewed === "true") {
      setShouldAnimate(false);
    }
  }, [leagueSlug, storageKey, number]);

  const handleAnimationEnd = React.useCallback(
    (e: React.AnimationEvent) => {
      const parent = (e.target as HTMLElement).parentElement;
      if (!parent) return;

      const animatedElements = parent.getElementsByClassName(
        "animate-fade-reveal"
      );
      if (e.target === animatedElements[animatedElements.length - 1]) {
        localStorage.setItem(storageKey, "true");
      }
    },
    [storageKey]
  );

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

  const wrapWordsWithAnimation = (htmlContent: string) => {
    if (!htmlContent) return "";
    if (!shouldAnimate) return htmlContent;

    let elementCount = 0;
    const parts = htmlContent.split(/(<[^>]*>)/g);

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
  };

  return (
    <div
      dangerouslySetInnerHTML={{
        __html: wrapWordsWithAnimation(content ?? ""),
      }}
      onAnimationEnd={handleAnimationEnd}
      className="prose dark:prose-invert prose-sm sm:prose-base mx-auto preview-content"
    />
  );
}
