import { User } from "./user";

export type UnlockMode = "LEVELS" | "TIMED" | "FREE";
export type TimedUnlockInterval = "DAILY" | "WEEKLY" | "CUSTOM";

export interface League {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  showIntro: boolean;
  introContent?: string | null;
  isPrivate: boolean;
  hasPaidTier: boolean;
  unlockMode: UnlockMode;
  timedUnlockInterval?: TimedUnlockInterval | null;
  startDate?: string | null;
  creatorId: string;
  creator?: User;
  createdAt: Date;
  updatedAt: Date;
}

export interface DraftLeague {
  name: string;
  description?: string | null;
  showIntro: boolean;
  introContent?: string | null;
  isPrivate: boolean;
  hasPaidTier: boolean;
  unlockMode: UnlockMode;
  timedUnlockInterval?: TimedUnlockInterval | null;
  startDate?: string | null;
}

// API response type
export type LeaguesResponse = League[];
