import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { TimedUnlockInterval } from "@prisma/client";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const SAMPLE_LEAGUES = [
  { id: "1", name: "Movie Buffs United", slug: "movie-buffs-united" },
  { id: "2", name: "Science Quiz League", slug: "science-quiz-league" },
  { id: "3", name: "History Champions", slug: "history-champions-ax12fg" },
];

export function toTitleCase(w: string): string {
  return w.charAt(0).toUpperCase() + w.slice(1, w.length);
}

export function getQuestionUnlockDate(
  startDate: string,
  questionNumber: number,
  unlockInterval: TimedUnlockInterval,
  customUnlockAt?: string
): Date {
  // Custom unlock date takes precedence
  if (unlockInterval === "CUSTOM" && customUnlockAt) {
    return new Date(customUnlockAt);
  }

  const unlockDate = new Date(startDate);

  switch (unlockInterval) {
    case "DAILY":
      unlockDate.setDate(unlockDate.getDate() + (questionNumber - 1));
      break;
    case "WEEKLY":
      unlockDate.setDate(unlockDate.getDate() + (questionNumber - 1) * 7);
      break;
    default:
      throw new Error(`Unsupported unlock interval: ${unlockInterval}`);
  }

  return unlockDate;
}

export function getAnswerUnlockDate(
  startDate: string,
  questionNumber: number,
  unlockInterval: TimedUnlockInterval,
  customUnlockAt?: string
): Date {
  const questionUnlockDate = getQuestionUnlockDate(
    startDate,
    questionNumber,
    unlockInterval,
    customUnlockAt
  );

  switch (unlockInterval) {
    case "DAILY":
      const answerDate = new Date(questionUnlockDate);
      answerDate.setDate(questionUnlockDate.getDate() + 1);
      return answerDate;
    case "WEEKLY":
      const weeklyAnswerDate = new Date(questionUnlockDate);
      weeklyAnswerDate.setDate(questionUnlockDate.getDate() + 7);
      return weeklyAnswerDate;
    case "CUSTOM":
      // For custom dates, answer unlocks 24 hours after question
      const customAnswerDate = new Date(questionUnlockDate);
      customAnswerDate.setDate(questionUnlockDate.getDate() + 1);
      return customAnswerDate;
  }
}

export function isLocked(unlockDate: Date | null): boolean {
  if (!unlockDate) return false;
  const now = new Date();
  return (
    now.getFullYear() < unlockDate.getFullYear() ||
    (now.getFullYear() === unlockDate.getFullYear() &&
      now.getMonth() < unlockDate.getMonth()) ||
    (now.getFullYear() === unlockDate.getFullYear() &&
      now.getMonth() === unlockDate.getMonth() &&
      now.getDate() < unlockDate.getDate())
  );
}

export function isUnlockedToday(unlockDate: Date | null): boolean {
  if (!unlockDate) return false;
  const now = new Date();
  return (
    now.getFullYear() === unlockDate.getFullYear() &&
    now.getMonth() === unlockDate.getMonth() &&
    now.getDate() === unlockDate.getDate()
  );
}
