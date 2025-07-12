export type Question = {
  id: string;
  number: number;
  content: string;
  genre: string;
  draft: boolean;
  previewImageUrl?: string | null;
  mediaUrl?: string | null;
  mediaType?: string | null;
  unlockAt?: string;
  leagueSlug: string;
  createdAt: Date;
  updatedAt: Date;
};

export type QuestionsResponse = Question[];

// ... existing MediaType and Question types ...

export type Answer = {
  id: string;
  title: string;
  keywords?: string;
  subtitle?: string | null;
  mediaUrl?: string | null;
  mediaType?: string | null;
  questionId: string;
  createdAt: Date;
  updatedAt: Date;
};

export interface DraftAnswer {
  title: string;
  keywords?: string;
  subtitle?: string;
  mediaUrl?: string;
  mediaType?: string;
  pendingMedia?: File;
}

export type Submission = {
  id: string;
  userId: string;
  questionId: string;
  content: string;
  score: number;
  isCorrect: boolean;
  nonCompetitive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

// Add response types for API calls
export type AnswerResponse = Answer;
export type SubmissionsResponse = Submission[];
