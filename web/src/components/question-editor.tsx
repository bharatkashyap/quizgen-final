"use client";
import * as React from "react";
import { Field, Select, Toggle, Input } from "@base-ui-components/react";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import { ResizableImage } from "../lib/ResizableImage";
import { useQuestion, useLeague } from "../hooks";
import { EditorContent, type Editor as EditorType } from "@tiptap/react";
import type { UnlockMode, TimedUnlockInterval } from "../types/league";
import Youtube from "@tiptap/extension-youtube";

import {
  Bold,
  Italic,
  Check,
  Clock,
  ChevronDown,
  List,
  ListOrdered,
  Undo,
  Redo,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Eye,
  EyeOff,
  Trash2,
  Youtube as YoutubeIcon,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { upsertQuestion, deleteQuestion } from "../app/actions/question";
import { GENRES } from "../lib/constants";
import { Skeleton } from "./ui/skeleton";
import { LoadingButton } from "./ui/loading-button";
import { AlertDialog } from "@base-ui-components/react/alert-dialog";
import { useFormStatus } from "react-dom";

interface QuestionEditorProps {
  leagueSlug: string;
  number?: string;
}

export function MenuBar({
  editor,
  isPreview,
  onPreviewChange,
}: {
  editor: EditorType | null;
  isPreview: boolean;
  onPreviewChange: (value: boolean) => void;
}) {
  const [showYoutubeDialog, setShowYoutubeDialog] = React.useState(false);
  const [youtubeUrl, setYoutubeUrl] = React.useState("");

  const addYoutubeVideo = () => {
    if (youtubeUrl.trim()) {
      editor?.commands.setYoutubeVideo({
        src: youtubeUrl,
      });
      setYoutubeUrl("");
      setShowYoutubeDialog(false);
    }
  };

  if (!editor) return null;

  return (
    <>
      <div className="border-b border-gray-200 dark:border-gray-800 pb-2 mb-2">
        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-2">
            <div className="flex gap-1 items-center">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  editor.chain().focus().undo().run();
                }}
                disabled={!editor.can().undo() || isPreview}
                className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50"
              >
                <Undo className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  editor.chain().focus().redo().run();
                }}
                disabled={!editor.can().redo() || isPreview}
                className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50"
              >
                <Redo className="h-4 w-4" />
              </button>
            </div>

            <div className="w-px h-6 bg-gray-200 dark:bg-gray-800" />

            <div className="flex gap-1 items-center">
              <button
                type="button"
                disabled={isPreview}
                onClick={(e) => {
                  e.preventDefault();
                  editor.chain().focus().toggleBold().run();
                }}
                className={`p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 ${
                  editor.isActive("bold") ? "bg-gray-100 dark:bg-gray-800" : ""
                }`}
              >
                <Bold className="h-4 w-4" />
              </button>
              <button
                type="button"
                disabled={isPreview}
                onClick={(e) => {
                  e.preventDefault();
                  editor.chain().focus().toggleItalic().run();
                }}
                className={`p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 ${
                  editor.isActive("italic")
                    ? "bg-gray-100 dark:bg-gray-800"
                    : ""
                }`}
              >
                <Italic className="h-4 w-4" />
              </button>
            </div>

            <div className="w-px h-6 bg-gray-200 dark:bg-gray-800" />

            <div className="flex gap-1 items-center">
              <button
                disabled={isPreview}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  editor.chain().focus().toggleBulletList().run();
                }}
                className={`p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 ${
                  editor.isActive("bulletList")
                    ? "bg-gray-100 dark:bg-gray-800"
                    : ""
                }`}
              >
                <List className="h-4 w-4" />
              </button>
              <button
                type="button"
                disabled={isPreview}
                onClick={(e) => {
                  e.preventDefault();
                  editor.chain().focus().toggleOrderedList().run();
                }}
                className={`p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 ${
                  editor.isActive("orderedList")
                    ? "bg-gray-100 dark:bg-gray-800"
                    : ""
                }`}
              >
                <ListOrdered className="h-4 w-4" />
              </button>
            </div>

            <div className="w-px h-6 bg-gray-200 dark:bg-gray-800" />

            <div className="flex gap-1 items-center">
              <button
                type="button"
                disabled={isPreview}
                onClick={(e) => {
                  e.preventDefault();
                  editor.chain().focus().setTextAlign("left").run();
                }}
                className={`p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 ${
                  editor.isActive({ textAlign: "left" })
                    ? "bg-gray-100 dark:bg-gray-800"
                    : ""
                }`}
              >
                <AlignLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                disabled={isPreview}
                onClick={(e) => {
                  e.preventDefault();
                  editor.chain().focus().setTextAlign("center").run();
                }}
                className={`p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 ${
                  editor.isActive({ textAlign: "center" })
                    ? "bg-gray-100 dark:bg-gray-800"
                    : ""
                }`}
              >
                <AlignCenter className="h-4 w-4" />
              </button>
              <button
                type="button"
                disabled={isPreview}
                onClick={(e) => {
                  e.preventDefault();
                  editor.chain().focus().setTextAlign("right").run();
                }}
                className={`p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 ${
                  editor.isActive({ textAlign: "right" })
                    ? "bg-gray-100 dark:bg-gray-800"
                    : ""
                }`}
              >
                <AlignRight className="h-4 w-4" />
              </button>
            </div>

            <div className="w-px h-6 bg-gray-200 dark:bg-gray-800" />

            <div className="flex gap-1 items-center">
              <button
                type="button"
                disabled={isPreview}
                onClick={() => setShowYoutubeDialog(true)}
                className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50"
              >
                <YoutubeIcon className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Toggle
              pressed={isPreview}
              defaultPressed={false}
              render={(props, state) => {
                if (state.pressed) {
                  return (
                    <button type="button" {...props}>
                      <Eye className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                    </button>
                  );
                }
                return (
                  <button type="button" {...props}>
                    <EyeOff className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                  </button>
                );
              }}
              onPressedChange={onPreviewChange}
              aria-label="Toggle preview mode"
              className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
            />
          </div>
        </div>
      </div>

      <AlertDialog.Root
        open={showYoutubeDialog}
        onOpenChange={setShowYoutubeDialog}
      >
        <AlertDialog.Portal>
          <AlertDialog.Backdrop className="fixed inset-0 bg-black/50" />
          <AlertDialog.Popup className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md rounded-lg bg-white dark:bg-gray-900 p-6 z-50">
            <AlertDialog.Title className="text-lg font-semibold mb-4">
              Add YouTube Video
            </AlertDialog.Title>
            <AlertDialog.Description className="text-gray-600 dark:text-gray-400 mb-6">
              Enter the URL of the YouTube video you want to embed.
            </AlertDialog.Description>

            <Field.Root className="mb-6">
              <Field.Label>YouTube URL</Field.Label>
              <Input
                type="url"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full px-3 py-2 rounded-md border border-gray-200 
                dark:border-gray-800 bg-white dark:bg-gray-900
                focus:outline-none focus:ring-2 focus:ring-blue-500/20 
                focus:border-blue-500 dark:focus:border-blue-500"
              />
            </Field.Root>

            <div className="flex gap-4 justify-end">
              <AlertDialog.Close
                render={() => (
                  <button
                    type="button"
                    onClick={() => {
                      setYoutubeUrl("");
                      setShowYoutubeDialog(false);
                    }}
                    className="px-4 py-2 rounded-md border border-gray-200 dark:border-gray-800 
                    bg-white/50 dark:bg-gray-900/50 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  >
                    Cancel
                  </button>
                )}
              />
              <button
                type="button"
                onClick={addYoutubeVideo}
                disabled={!youtubeUrl.trim()}
                className="px-4 py-2 rounded-md bg-blue-500 text-white 
                hover:bg-blue-600 disabled:opacity-50"
              >
                Add Video
              </button>
            </div>
          </AlertDialog.Popup>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </>
  );
}

interface EditorProps {
  isLoading: boolean;
  isPreview: boolean;
  editor: EditorType | null;
  number?: string;
}

function Editor({ isLoading, isPreview, editor, number }: EditorProps) {
  if (isLoading) {
    return (
      <div className="space-y-4 p-4 mb-0">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-2/3" />
        <Skeleton className="h-6 w-5/6" />
        <Skeleton className="h-6 w-full" />
      </div>
    );
  }

  if (isPreview) {
    return (
      <div className="bg-black text-white min-h-[300px] p-8 rounded-lg relative">
        <div className="text-5xl text-center font-bold text-yellow-500 mb-6">
          {number ?? "#"}
        </div>

        <div
          dangerouslySetInnerHTML={{ __html: editor?.getHTML() ?? "" }}
          className="prose dark:prose-invert prose-sm sm:prose-base mx-auto preview-content"
        />
      </div>
    );
  }

  return (
    <div className="relative">
      <EditorContent editor={editor} />
    </div>
  );
}

function StatusIndicator({
  draft,
  isLoading,
}: {
  draft?: boolean;
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <div className="px-3 my-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-md">
        <Skeleton className="h-6 w-48" />
      </div>
    );
  }

  if (draft === false)
    return (
      <div className="px-3 my-4 py-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-sm rounded-md flex items-center gap-2">
        <span className="font-medium">Published</span>
        <span className="text-green-600 dark:text-green-300">
          – This question is live
        </span>
      </div>
    );

  return (
    <div className="px-3 my-4 py-2 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 text-sm rounded-md flex items-center gap-2">
      <span className="font-medium">Draft</span>
      <span className="text-yellow-600 dark:text-yellow-300">
        – This question is not yet published
      </span>
    </div>
  );
}

function DeleteButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md disabled:opacity-50"
    >
      {pending ? "Deleting..." : "Delete Question"}
    </button>
  );
}

function EditorHeader({
  isLoading,
  isDraft,
  number,
  selectedGenre,
  hasChanges,
  unlockMode,
  selectedUnlockAt,
  setUnlockAt,
  startDate,
  timedUnlockInterval,
  setSelectedGenre,
  leagueSlug,
  setShowDeleteDialog,
}: {
  isLoading: boolean;
  isDraft: boolean | null;
  number?: string;
  selectedGenre: string;
  initialGenre: string;
  hasChanges: boolean;
  unlockMode?: UnlockMode;
  selectedUnlockAt?: string;
  setUnlockAt: (unlockAt: string) => void;
  timedUnlockInterval?: TimedUnlockInterval | null;
  startDate?: string | null;
  setSelectedGenre: (genre: string) => void;
  leagueSlug: string;
  setShowDeleteDialog: (show: boolean) => void;
}) {
  const router = useRouter();

  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
      <div className="flex items-center gap-4">
        <Field.Root className="w-[100px]">
          {isLoading ? (
            <Skeleton className="h-10 w-full" />
          ) : (
            <Select.Root
              name="genre"
              value={selectedGenre}
              onValueChange={setSelectedGenre}
            >
              <Select.Trigger
                className="w-full px-3 py-2 rounded-md border border-gray-200 
                  dark:border-gray-800 bg-white dark:bg-gray-900
                  focus:outline-none focus:ring-2 focus:ring-blue-500/20 
                  focus:border-blue-500 dark:focus:border-blue-500
                  flex items-center justify-between"
              >
                <Select.Value placeholder="Select a genre" />
                <Select.Icon>
                  <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                </Select.Icon>
              </Select.Trigger>

              <Select.Portal>
                <Select.Positioner>
                  <Select.Popup
                    className="z-50 min-w-[100px] overflow-hidden rounded-md border 
                    border-gray-200 bg-white shadow-lg dark:border-gray-800 dark:bg-gray-900"
                  >
                    {GENRES.map((genre) => (
                      <Select.Item
                        key={genre}
                        value={genre.toLowerCase()}
                        className="flex items-center justify-between px-3 py-2 text-sm text-gray-700 
                          dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                      >
                        <Select.ItemText>{genre}</Select.ItemText>
                        <Select.ItemIndicator>
                          <Check className="h-4 w-4 text-blue-500" />
                        </Select.ItemIndicator>
                      </Select.Item>
                    ))}
                  </Select.Popup>
                </Select.Positioner>
              </Select.Portal>
            </Select.Root>
          )}
        </Field.Root>
      </div>

      {unlockMode === "TIMED" && (
        <div className="flex items-center gap-2 mx-4">
          <Clock className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          {timedUnlockInterval === "CUSTOM" ? (
            <input
              type="datetime-local"
              value={selectedUnlockAt}
              onChange={(e) => setUnlockAt(e.target.value)}
              className="px-2 py-1.5 text-sm rounded-md border border-gray-200 
                dark:border-gray-800 bg-white/50 dark:bg-gray-900/50
                focus:outline-none focus:ring-2 focus:ring-blue-500/20
                w-auto"
            />
          ) : (
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {startDate
                ? getUnlockDate(
                    startDate,
                    timedUnlockInterval,
                    parseInt(number || "1")
                  )?.toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })
                : "Auto-scheduled"}
            </span>
          )}
        </div>
      )}

      <div className="flex items-center gap-3">
        {isLoading ? (
          <div className="flex gap-3">
            <Skeleton className="h-9 w-24" />{" "}
            {/* Adjust width based on your button sizes */}
            <Skeleton className="h-9 w-32" />
          </div>
        ) : isDraft === false ? (
          <>
            <LoadingButton
              name="draft"
              value="false"
              loadingText="Saving..."
              className="px-4 py-2 text-sm bg-gradient-to-r from-blue-500 to-purple-500 text-white
            hover:from-blue-600 hover:to-purple-600 disabled:opacity-50"
              disabled={isLoading || !hasChanges}
            >
              Save Changes
            </LoadingButton>
            <button
              type="button"
              onClick={() => setShowDeleteDialog(true)}
              className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </>
        ) : (
          <>
            <LoadingButton
              name="draft"
              value="true"
              loadingText="Saving..."
              className="px-4 py-2 text-sm rounded-md border border-gray-200 dark:border-gray-800
              bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 
              hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50"
              disabled={isLoading || !hasChanges}
            >
              Save as Draft
            </LoadingButton>
            <LoadingButton
              name="draft"
              value="false"
              loadingText="Publishing..."
              className="px-4 py-2 text-sm bg-gradient-to-r from-blue-500 to-purple-500 text-white
              hover:from-blue-600 hover:to-purple-600 disabled:opacity-50"
              disabled={isLoading || !hasChanges}
            >
              Save and Publish
            </LoadingButton>
          </>
        )}
      </div>
    </div>
  );
}

function getUnlockDate(
  startDate: string | null,
  interval?: TimedUnlockInterval | null,
  questionNumber?: number
) {
  if (!startDate || !questionNumber) {
    throw new Error(
      "getUnlockDate: startDate or questionNumber is falsy. This should never happen"
    );
  }
  const start = new Date(startDate);
  switch (interval) {
    case "DAILY":
      return new Date(
        start.getTime() + (questionNumber - 1) * 24 * 60 * 60 * 1000
      );
    case "WEEKLY":
      return new Date(
        start.getTime() + (questionNumber - 1) * 7 * 24 * 60 * 60 * 1000
      );
    default:
      return null;
  }
}

export default function QuestionEditor({
  leagueSlug,
  number,
}: QuestionEditorProps) {
  const router = useRouter();
  const { data: question, isLoading } = useQuestion(leagueSlug, number);
  const { data: league } = useLeague(leagueSlug);

  const [isPreview, setIsPreview] = React.useState(false);
  const [selectedGenre, setSelectedGenre] = React.useState(
    question?.genre || GENRES[0].toLowerCase()
  );
  const [initialGenre, setInitialGenre] = React.useState(
    question?.genre || GENRES[0].toLowerCase()
  );
  const [selectedUnlockAt, setSelectedUnlockAt] = React.useState(
    question?.unlockAt
  );

  const [initialUnlockAt, setInitialUnlockAt] = React.useState(
    question?.unlockAt
  );
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        bulletList: {
          HTMLAttributes: {
            class: "list-disc ml-6 [&_li]:mb-3 [&_li:last-child]:mb-0",
          },
        },
      }),
      Placeholder.configure({
        placeholder: "Write your question here...",
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
        alignments: ["left", "center", "right"],
      }),
      ResizableImage,
      Youtube.configure({
        width: 640,
        height: 480,
        modestBranding: true,
        controls: true,
        nocookie: true,
        HTMLAttributes: {
          class:
            "mx-auto my-4 aspect-video w-full max-w-2xl rounded-lg overflow-hidden",
        },
      }),
    ],
    content: question?.content || "",
    editorProps: {
      attributes: {
        class:
          "prose dark:prose-invert prose-sm sm:prose-base mx-auto focus:outline-none min-h-[150px]",
      },
    },
  });

  React.useEffect(() => {
    if (editor && !isLoading && question) {
      editor.commands.setContent(question.content);
      setSelectedGenre(question.genre);
      setSelectedUnlockAt(question.unlockAt);
      setInitialGenre(question.genre);
      setInitialUnlockAt(question.unlockAt);
    }
  }, [editor, question, isLoading]);

  const hasChanges = React.useMemo(() => {
    if (!editor) return false;
    if (!question) {
      if (editor.getHTML() === "<p></p>") return false;
      return true;
    }
    const contentChanged = editor.getHTML() !== question.content;
    const genreChanged = selectedGenre !== question.genre;
    const unlockChanged = selectedUnlockAt !== question.unlockAt;
    return contentChanged || genreChanged || unlockChanged;
  }, [editor?.getHTML(), question, selectedGenre, league, selectedUnlockAt]);

  async function onSubmit(formData: FormData) {
    try {
      if (editor) {
        formData.append("content", editor.getHTML());
        if (selectedUnlockAt) {
          formData.append("unlockAt", selectedUnlockAt);
        } else if (league?.unlockMode === "TIMED" && !selectedUnlockAt) {
          formData.append(
            "unlockAt",
            getUnlockDate(
              league?.startDate || "",
              league?.timedUnlockInterval,
              parseInt(number || "1")
            )?.toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
            }) || ""
          );
        }

        formData.append("genre", selectedGenre);
      }

      const response = await upsertQuestion(formData, leagueSlug, number);

      if (response.message) {
        if (!response.id) {
          toast.error(response.message);
          return;
        }
        toast.success(response.message);
      }
      router.push(`/league/${leagueSlug}/questions`);
    } catch (error) {
      throw error;
    }
  }

  async function handleDelete(formData: FormData) {
    try {
      if (!question) {
        throw new Error(
          "An unexpected error occurred. Try refreshing the page."
        );
      }

      formData.set("questionId", question.id);
      formData.set("leagueSlug", leagueSlug);

      const response = await deleteQuestion(formData);

      if (response.success) {
        toast.success(response.message);
        router.push(`/league/${leagueSlug}/questions`);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error((error as unknown as Error)?.message);
    } finally {
      setShowDeleteDialog(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <StatusIndicator draft={question?.draft} isLoading={isLoading} />
      <form action={onSubmit} className="space-y-8">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
          <EditorHeader
            isLoading={isLoading}
            number={number}
            isDraft={question?.draft ?? null}
            selectedGenre={selectedGenre}
            timedUnlockInterval={league?.timedUnlockInterval}
            startDate={league?.startDate}
            unlockMode={league?.unlockMode}
            selectedUnlockAt={selectedUnlockAt}
            setUnlockAt={setSelectedUnlockAt}
            initialGenre={initialGenre}
            hasChanges={hasChanges}
            setSelectedGenre={setSelectedGenre}
            leagueSlug={leagueSlug}
            setShowDeleteDialog={setShowDeleteDialog}
          />

          <div className="p-4">
            <MenuBar
              editor={editor}
              isPreview={isPreview}
              onPreviewChange={setIsPreview}
            />
            {isPreview ? (
              <Editor
                isLoading={isLoading}
                isPreview={isPreview}
                editor={editor}
                number={number}
              />
            ) : (
              <div className="p-4">
                <EditorContent editor={editor} />
              </div>
            )}
          </div>
        </div>
      </form>

      <AlertDialog.Root
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
      >
        <AlertDialog.Portal>
          <AlertDialog.Backdrop className="fixed inset-0 bg-black/50" />
          <AlertDialog.Popup className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md rounded-lg bg-white dark:bg-gray-900 p-6">
            <AlertDialog.Title className="text-lg font-semibold mb-4">
              Delete Question
            </AlertDialog.Title>
            <AlertDialog.Description className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to delete this question? This will delete
              all related answer and submission data. This action cannot be
              undone.
            </AlertDialog.Description>
            <form action={handleDelete} className="flex gap-4 justify-end">
              <AlertDialog.Close
                render={() => (
                  <button
                    type="button"
                    onClick={() => setShowDeleteDialog(false)}
                    className="px-4 py-2 rounded-md border border-gray-200 dark:border-gray-800 
                  bg-white/50 dark:bg-gray-900/50 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  >
                    Cancel
                  </button>
                )}
              />
              <DeleteButton />
            </form>
          </AlertDialog.Popup>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </div>
  );
}
