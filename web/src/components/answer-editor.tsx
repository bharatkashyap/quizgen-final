"use client";

import * as React from "react";
import { Input, Field } from "@base-ui-components/react";
import { LoadingButton } from "./ui/loading-button";
import { upsertAnswer } from "../app/actions/answer";
import { toast } from "sonner";
import { useAnswer } from "../hooks";
import { Skeleton } from "./ui/skeleton";
import { AnswerPreview } from "./answer-preview";
import type { DraftAnswer } from "../types/question";

interface AnswerEditorProps {
  leagueSlug: string;
  questionNumber?: string;
}

export default function AnswerEditor({
  leagueSlug,
  questionNumber,
}: AnswerEditorProps) {
  const storageKey = `draft-answer-${leagueSlug}-${questionNumber}`;
  const { data: existingAnswer, isLoading } = useAnswer(
    leagueSlug,
    questionNumber
  );

  const [draftAnswer, setDraftAnswer] = React.useState<DraftAnswer>(() => {
    return {
      title: "",
      keywords: "",
      subtitle: "",
      mediaUrl: "",
      mediaType: "",
    };
  });

  // Track initial state for comparison
  const [initialAnswer, setInitialAnswer] = React.useState<DraftAnswer>(() => {
    return { title: "", keywords: "", subtitle: "", mediaUrl: "" };
  });

  // Update initial state when existing answer loads
  React.useEffect(() => {
    if (existingAnswer) {
      const initial = {
        title: existingAnswer.title,
        keywords: existingAnswer.keywords,
        mediaUrl: existingAnswer.mediaUrl || "",
        subtitle: existingAnswer.subtitle || "",
      };
      setInitialAnswer(initial);
      setDraftAnswer(initial);
    }
  }, [existingAnswer]);

  // Check if current state matches initial state
  const hasChanges = React.useMemo(() => {
    return (
      draftAnswer.title !== initialAnswer.title ||
      draftAnswer.keywords !== initialAnswer.keywords ||
      draftAnswer.mediaUrl !== initialAnswer.mediaUrl ||
      draftAnswer.subtitle !== initialAnswer.subtitle
    );
  }, [draftAnswer, initialAnswer]);

  // Update draft when existing answer loads
  React.useEffect(() => {
    if (existingAnswer) {
      setDraftAnswer({
        title: existingAnswer.title,
        keywords: existingAnswer.keywords,
        mediaUrl: existingAnswer.mediaUrl || "",
        subtitle: existingAnswer.subtitle || "",
      });
    }
  }, [existingAnswer]);

  // Save to localStorage whenever draftAnswer changes
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(storageKey, JSON.stringify(draftAnswer));
    }
  }, [draftAnswer, storageKey]);

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (e.g., 5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    setDraftAnswer((prev) => ({
      ...prev,
      pendingMedia: file,
    }));
  };

  // Remove pending media
  const removePendingMedia = () => {
    setDraftAnswer((prev) => {
      const { pendingMedia, ...rest } = prev;
      return rest;
    });
  };

  async function onSubmit(formData: FormData) {
    try {
      // If there's pending media, upload it first
      if (draftAnswer.pendingMedia) {
        // Add the file to formData
        formData.append("file", draftAnswer.pendingMedia);
      }

      const response = await upsertAnswer(formData, leagueSlug, questionNumber);
      if (response.id) {
        toast.success("Answer saved successfully");
        // Clear localStorage after successful save
        localStorage.removeItem(storageKey);
        // Clear pending media
        removePendingMedia();
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      throw error;
    }
  }

  return (
    <form action={onSubmit} className="max-w-4xl mx-auto space-y-6">
      <Field.Root>
        <Field.Label>Title</Field.Label>
        {isLoading ? (
          <Skeleton className="h-10 w-full" />
        ) : (
          <Input
            name="title"
            placeholder="Enter answer title"
            required
            maxLength={100}
            value={draftAnswer.title}
            onChange={(e) =>
              setDraftAnswer({ ...draftAnswer, title: e.target.value })
            }
            className="w-full px-3 py-2 rounded-md border border-gray-200 
              dark:border-gray-800 bg-white/50 dark:bg-gray-900/50
              focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        )}
      </Field.Root>

      <Field.Root>
        <Field.Label>Subtitle (optional)</Field.Label>
        {isLoading ? (
          <Skeleton className="h-10 w-full" />
        ) : (
          <Input
            name="subtitle"
            placeholder="Enter a subtitle"
            value={draftAnswer.subtitle}
            onChange={(e) =>
              setDraftAnswer({ ...draftAnswer, subtitle: e.target.value })
            }
            className="w-full px-3 py-2 rounded-md border border-gray-200 
              dark:border-gray-800 bg-white/50 dark:bg-gray-900/50
              focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        )}
      </Field.Root>

      <Field.Root>
        <Field.Label>Keywords</Field.Label>
        <div className="space-y-2">
          {isLoading ? (
            <Skeleton className="h-24 w-full" />
          ) : (
            <textarea
              name="keywords"
              placeholder="Enter the answer keywords (comma-separated)"
              required
              value={draftAnswer.keywords}
              onChange={(e) =>
                setDraftAnswer({ ...draftAnswer, keywords: e.target.value })
              }
              className="w-full px-3 py-2 rounded-md border border-gray-200 
                dark:border-gray-800 bg-white/50 dark:bg-gray-900/50
                focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          )}
        </div>
      </Field.Root>

      <Field.Root>
        <Field.Label>Media (optional)</Field.Label>
        <div className="space-y-2">
          {isLoading ? (
            <Skeleton className="h-32 w-full" />
          ) : (
            <div className="space-y-2">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                id="media-upload"
              />
              <label
                htmlFor="media-upload"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-gray-200 
                  dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 
                  hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
              >
                <span>Upload Image</span>
              </label>
              {(draftAnswer.mediaUrl || draftAnswer.pendingMedia) && (
                <button
                  type="button"
                  onClick={removePendingMedia}
                  className="ml-2 text-sm text-red-500 hover:text-red-600"
                >
                  Remove
                </button>
              )}
            </div>
          )}
        </div>
      </Field.Root>

      <div className="space-y-3">
        <Field.Root>
          <Field.Label>Preview</Field.Label>
          {isLoading ? (
            <Skeleton className="h-32 w-full" />
          ) : (
            <AnswerPreview
              title={draftAnswer.title}
              subtitle={draftAnswer.subtitle}
              questionNumber={questionNumber}
              mediaUrl={draftAnswer.mediaUrl}
              pendingMedia={draftAnswer.pendingMedia}
            />
          )}
        </Field.Root>
      </div>

      <LoadingButton
        type="submit"
        loadingText="Saving..."
        disabled={isLoading || !hasChanges}
        className="bg-gradient-to-r from-blue-500 to-purple-500 text-white
          hover:from-blue-600 hover:to-purple-600 disabled:opacity-50"
      >
        Save Answer
      </LoadingButton>
    </form>
  );
}
