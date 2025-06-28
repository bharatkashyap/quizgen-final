"use client";
import * as React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Field } from "@base-ui-components/react/field";
import { Input } from "@base-ui-components/react/input";
import { Switch } from "@base-ui-components/react/switch";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import { LoadingButton } from "./ui/loading-button";
import { DraftLeague } from "../types/league";
import { IntroMenuBar } from "./intro-menu-bar";
import { useLeague } from "../hooks";
import LeagueNotFound from "./league-not-found";
import PaidBadge from "./paid-badge";

interface LeagueFormProps {
  onSubmit: (
    formData: FormData,
    slug?: string
  ) => Promise<{ message: string; slug?: string }>;

  submitText?: string;
  showCancelButton?: boolean;
}

const defaultDraftLeague: DraftLeague = {
  name: "",
  description: "",
  showIntro: false,
  introContent: "",
  isPrivate: false,
  hasPaidTier: false,
  unlockMode: "TIMED",
  startDate: "",
};

const UNLOCK_INTERVALS = [
  {
    value: "DAILY",
    label: "Daily",
    description: "One level per day",
  },
  {
    value: "WEEKLY",
    label: "Weekly",
    description: "One level per week",
  },
  {
    value: "CUSTOM",
    label: "Custom",
    description: "Set dates manually",
  },
] as const;

const UNLOCK_MODES = [
  {
    value: "FREE",
    label: "Free",
    description: "All levels are unlocked",
  },
  {
    value: "TIMED",
    label: "Timed",
    description: "Levels unlock at specific times",
  },
  {
    value: "STEPS",
    label: "Steps",
    description: "Next level unlocks when previous is solved",
  },
] as const;

export default function LeagueForm({
  onSubmit,
  submitText = "Create League",
  showCancelButton = true,
}: LeagueFormProps) {
  const router = useRouter();
  const params = useParams();
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const isProUser = session?.user?.isPro;
  const slug = params?.leagueSlug as string;
  const { data: league, isLoading, refetch } = useLeague(slug || "");
  const [initialLeague, setInitialLeague] = React.useState(league);
  const [draftLeague, setDraftLeague] = React.useState<DraftLeague>(
    league
      ? {
          name: league.name,
          description: league.description || "",
          showIntro: league.showIntro,
          introContent: league.introContent || "",
          isPrivate: league.isPrivate,
          hasPaidTier: league.hasPaidTier,
          unlockMode: league.unlockMode,
          timedUnlockInterval: league.timedUnlockInterval,
          startDate: league.startDate,
        }
      : defaultDraftLeague
  );

  // Update draft and initial when league data loads
  React.useEffect(() => {
    if (league) {
      setDraftLeague({
        name: league.name,
        description: league.description || "",
        showIntro: league.showIntro,
        introContent: league.introContent || "",
        isPrivate: league.isPrivate,
        hasPaidTier: league.hasPaidTier,
        unlockMode: league.unlockMode,
        timedUnlockInterval: league.timedUnlockInterval,
        startDate: league.startDate,
      });
      setInitialLeague(league);
    }
  }, [league]);

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
        placeholder: "Write an introduction for your league...",
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
        alignments: ["left", "center", "right"],
      }),
    ],
    content: league?.introContent || "",
    editorProps: {
      attributes: {
        class:
          "prose dark:prose-invert prose-sm sm:prose-base mx-auto focus:outline-none min-h-[150px]",
      },
    },
    onUpdate: ({ editor }) => {
      setDraftLeague((prev) => ({
        ...prev,
        introContent: editor.getHTML(),
      }));
    },
  });

  // Only set editor content once when league data first loads
  React.useEffect(() => {
    if (editor && league?.introContent && !editor.getText().trim()) {
      editor.commands.setContent(league.introContent);
    }
  }, [editor, league]);

  const hasChanges = React.useMemo(() => {
    if (!initialLeague) return true;

    return (
      draftLeague.name !== initialLeague.name ||
      draftLeague.description !== initialLeague.description ||
      draftLeague.isPrivate !== initialLeague.isPrivate ||
      draftLeague.hasPaidTier !== initialLeague.hasPaidTier ||
      draftLeague.showIntro !== initialLeague.showIntro ||
      draftLeague.introContent !== initialLeague.introContent ||
      draftLeague.unlockMode !== initialLeague.unlockMode ||
      draftLeague.timedUnlockInterval !== initialLeague.timedUnlockInterval ||
      draftLeague.startDate !== initialLeague.startDate
    );
  }, [draftLeague, initialLeague]);

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-8">
        <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded w-1/2" />
        <div className="h-32 bg-gray-200 dark:bg-gray-800 rounded" />
        <div className="space-y-4">
          <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded w-1/3" />
          <div className="grid grid-cols-2 gap-4">
            <div className="h-24 bg-gray-200 dark:bg-gray-800 rounded" />
            <div className="h-24 bg-gray-200 dark:bg-gray-800 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (slug && !league) {
    return <LeagueNotFound />;
  }

  return (
    <form
      action={async (formData) => {
        formData.set("showIntro", draftLeague.showIntro.toString());
        formData.set("isPrivate", draftLeague.isPrivate.toString());
        formData.set("hasPaidTier", draftLeague.hasPaidTier.toString());

        if (draftLeague.timedUnlockInterval) {
          formData.append(
            "timedUnlockInterval",
            draftLeague.timedUnlockInterval
          );
        }

        if (draftLeague.introContent) {
          formData.append("introContent", draftLeague.introContent);
        }

        if (draftLeague.startDate) {
          formData.set("startDate", draftLeague.startDate);
        }

        await onSubmit(formData);
        refetch();
        queryClient.invalidateQueries({ queryKey: ["league/all"] });
      }}
      className="space-y-8"
    >
      <Field.Root>
        <Field.Label>League Name</Field.Label>
        <Input
          name="name"
          placeholder="Enter league name"
          required
          maxLength={50}
          defaultValue={league?.name}
          onChange={(e) =>
            setDraftLeague((prev) => ({ ...prev, name: e.target.value }))
          }
          className="w-full px-3 py-2 rounded-md border border-gray-200 
            dark:border-gray-800 bg-white/50 dark:bg-gray-900/50
            focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        />
      </Field.Root>

      <Field.Root>
        <Field.Label>Description</Field.Label>
        <textarea
          name="description"
          placeholder="Describe your league..."
          defaultValue={league?.description || ""}
          onChange={(e) =>
            setDraftLeague((prev) => ({ ...prev, description: e.target.value }))
          }
          className="h-32 w-full px-3 py-2 rounded-md border border-gray-200 
            dark:border-gray-800 bg-white/50 dark:bg-gray-900/50
            focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        />
      </Field.Root>

      <div className="space-y-4">
        <Field.Root>
          <Field.Label>Unlock Mode</Field.Label>
          <div className="grid grid-cols-3 gap-4 mt-2">
            {UNLOCK_MODES.map((mode) => (
              <label
                key={mode.value}
                className={`relative flex cursor-pointer rounded-lg border p-4 
                ${
                  draftLeague?.unlockMode === mode.value
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                    : "border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                }`}
                onClick={() => {
                  setDraftLeague((prev) => ({
                    ...prev,
                    unlockMode: mode.value,
                    ...(mode.value === "STEPS"
                      ? { timedUnlockInterval: undefined, startDate: "" }
                      : {
                          timedUnlockInterval:
                            prev.timedUnlockInterval || "DAILY",
                        }),
                  }));
                }}
              >
                <input
                  type="radio"
                  name="unlockMode"
                  value={mode.value}
                  checked={draftLeague?.unlockMode === mode.value}
                  className="sr-only"
                  readOnly
                />
                <span className="flex flex-col">
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {mode.label}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {mode.description}
                  </span>
                </span>
              </label>
            ))}
          </div>
        </Field.Root>

        <div className={draftLeague?.unlockMode === "TIMED" ? "" : "hidden"}>
          <Field.Root>
            <Field.Label>Unlock Interval</Field.Label>
            <div className="grid grid-cols-3 gap-4 mt-2">
              {UNLOCK_INTERVALS.map((interval) => (
                <label
                  key={interval.value}
                  className={`relative flex cursor-pointer rounded-lg border p-4 
                  ${
                    draftLeague?.timedUnlockInterval === interval.value
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      : "border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  }`}
                >
                  <input
                    type="radio"
                    name="timedUnlockInterval"
                    value={interval.value}
                    defaultChecked={
                      league?.timedUnlockInterval === interval.value
                    }
                    className="sr-only"
                    onChange={() =>
                      setDraftLeague((prev) => ({
                        ...prev,
                        timedUnlockInterval: interval.value,
                      }))
                    }
                  />
                  <span className="flex flex-col">
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {interval.label}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {interval.description}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </Field.Root>

          <div className="mt-4 pl-4 border-l-2 border-gray-200 dark:border-gray-800">
            <Field.Root>
              <Field.Label className="text-sm">Start Date</Field.Label>
              <Input
                type="date"
                name="startDate"
                value={
                  draftLeague.startDate || new Date().toISOString().slice(0, 10)
                }
                onChange={(e) => {
                  if (e.target.value) {
                    setDraftLeague((prev) => ({
                      ...prev,
                      startDate: e.target.value, // Already in YYYY-MM-DD format
                    }));
                  }
                }}
                className="w-full px-3 py-2 rounded-md border border-gray-200 
                  dark:border-gray-800 bg-white/50 dark:bg-gray-900/50
                  focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
              <Field.Description className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                {draftLeague?.startDate ? (
                  <>
                    First question will unlock on{" "}
                    <span>{draftLeague.startDate}</span>
                  </>
                ) : (
                  "When should the first question unlock?"
                )}
              </Field.Description>
            </Field.Root>
          </div>
        </div>
      </div>

      <Field.Root>
        <div className="flex items-center justify-between mb-2">
          <Field.Label>Introduction Content</Field.Label>
          <Switch.Root
            defaultChecked={league?.showIntro}
            name="showIntro"
            onCheckedChange={(checked) =>
              setDraftLeague((prev) => ({ ...prev, showIntro: checked }))
            }
            className="relative flex h-6 w-10 rounded-full bg-gradient-to-r from-gray-700 from-35% to-gray-200 to-65% bg-[length:6.5rem_100%] bg-[100%_0%] bg-no-repeat p-px shadow-[inset_0_1.5px_2px] shadow-gray-200 outline outline-offset-1 outline-gray-200 transition-[background-position,box-shadow] duration-[125ms] ease-[cubic-bezier(0.26,0.75,0.38,0.45)] before:absolute before:rounded-full before:outline-offset-2 before:outline-blue-800 focus-visible:before:inset-0 focus-visible:before:outline-2 data-[checked]:bg-gray-500 dark:from-gray-500 dark:shadow-black/75 dark:outline-white/15 dark:data-[checked]:shadow-none"
          >
            <Switch.Thumb className="aspect-square h-full rounded-full bg-white shadow-[0_0_1px_1px,0_1px_1px,1px_2px_4px_-1px] shadow-gray-100 transition-transform duration-150 data-[checked]:translate-x-4 dark:shadow-black/25" />
          </Switch.Root>
        </div>
        <Field.Description className="text-sm text-gray-500 dark:text-gray-400 mb-2">
          Show an introduction when users first visit your league
        </Field.Description>

        {draftLeague.showIntro && (
          <div className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
            <IntroMenuBar editor={editor} />
            <div className="p-4">
              <EditorContent editor={editor} />
            </div>
          </div>
        )}
      </Field.Root>

      <Field.Root>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Field.Label>Private League</Field.Label>

            <PaidBadge />
          </div>
          <Switch.Root
            name="isPrivate"
            defaultChecked={league?.isPrivate ?? false}
            disabled={!isProUser}
            className="relative flex h-6 w-10 rounded-full bg-gradient-to-r from-gray-700 from-35% to-gray-200 to-65% bg-[length:6.5rem_100%] bg-[100%_0%] bg-no-repeat p-px shadow-[inset_0_1.5px_2px] shadow-gray-200 outline outline-1 -outline-offset-1 outline-gray-200 transition-[background-position,box-shadow] duration-[125ms] ease-[cubic-bezier(0.26,0.75,0.38,0.45)] before:absolute before:rounded-full before:outline-offset-2 before:outline-blue-800 focus-visible:before:inset-0 focus-visible:before:outline focus-visible:before:outline-2 data-[checked]:bg-[0%_0%] data-[checked]:active:bg-gray-500 dark:from-gray-500 dark:shadow-black/75 dark:outline-white/15 dark:data-[checked]:shadow-none disabled:bg-none disabled:bg-gray-200 disabled:dark:bg-gray-800 disabled:cursor-not-allowed disabled:shadow-none"
            onCheckedChange={(checked) =>
              setDraftLeague((prev) => ({ ...prev, isPrivate: checked }))
            }
          >
            <Switch.Thumb className="aspect-square h-full rounded-full bg-white shadow-[0_0_1px_1px,0_1px_1px,1px_2px_4px_-1px] shadow-gray-100 transition-transform duration-150 data-[checked]:translate-x-4 dark:shadow-black/25 disabled:bg-gray-400 disabled:dark:bg-gray-600" />
          </Switch.Root>
        </div>
        <Field.Description className="text-sm text-gray-500 dark:text-gray-400 mb-2">
          Only allow invited users to access the league
        </Field.Description>
      </Field.Root>

      <Field.Root>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Field.Label>Paid Tier</Field.Label>
            <PaidBadge />
          </div>
          <Switch.Root
            name="hasPaidTier"
            defaultChecked={league?.hasPaidTier ?? false}
            disabled={!isProUser}
            className="relative flex h-6 w-10 rounded-full bg-gradient-to-r from-gray-700 from-35% to-gray-200 to-65% bg-[length:6.5rem_100%] bg-[100%_0%] bg-no-repeat p-px shadow-[inset_0_1.5px_2px] shadow-gray-200 outline outline-1 -outline-offset-1 outline-gray-200 transition-[background-position,box-shadow] duration-[125ms] ease-[cubic-bezier(0.26,0.75,0.38,0.45)] before:absolute before:rounded-full before:outline-offset-2 before:outline-blue-800 focus-visible:before:inset-0 focus-visible:before:outline focus-visible:before:outline-2 data-[checked]:bg-[0%_0%] data-[checked]:active:bg-gray-500 dark:from-gray-500 dark:shadow-black/75 dark:outline-white/15 dark:data-[checked]:shadow-none disabled:bg-none disabled:bg-gray-200 disabled:dark:bg-gray-800 disabled:cursor-not-allowed disabled:shadow-none"
            onCheckedChange={(checked) =>
              setDraftLeague((prev) => ({ ...prev, hasPaidTier: checked }))
            }
          >
            <Switch.Thumb className="aspect-square h-full rounded-full bg-white shadow-[0_0_1px_1px,0_1px_1px,1px_2px_4px_-1px] shadow-gray-100 transition-transform duration-150 data-[checked]:translate-x-4 dark:shadow-black/25 disabled:bg-gray-400 disabled:dark:bg-gray-600" />
          </Switch.Root>
        </div>
        <Field.Description className="text-sm text-gray-500 dark:text-gray-400 mb-2">
          Allow users to buy pro memberships of your league
        </Field.Description>
      </Field.Root>

      <div className="flex gap-4">
        {showCancelButton && (
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 rounded-md border border-gray-200 
              dark:border-gray-800 bg-white/50 dark:bg-gray-900/50
              hover:bg-gray-50 dark:hover:bg-gray-800/50
              disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
        )}
        <LoadingButton
          type="submit"
          loadingText="Saving..."
          disabled={!hasChanges}
          className="bg-gradient-to-r from-blue-500 to-purple-500 text-white
            hover:from-blue-600 hover:to-purple-600 disabled:opacity-50"
        >
          {submitText}
        </LoadingButton>
      </div>
    </form>
  );
}
