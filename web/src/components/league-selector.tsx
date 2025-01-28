"use client";
import * as React from "react";
import { Select } from "@base-ui-components/react/select";
import { useLeagues } from "../hooks";
import { useRouter } from "next/navigation";
import { PlusCircle, Check, ChevronDown } from "lucide-react";
import { Skeleton } from "./ui/skeleton";
import CreateFirstLeague from "./create-first-league";
import { useSession } from "next-auth/react";

export function LeagueSelector() {
  const { data: session, status: sessionStatus } = useSession();
  const { data: leagues, isLoading } = useLeagues();

  const router = useRouter();

  if (isLoading || sessionStatus === "loading") {
    return <Skeleton className="h-9 w-[200px]" />;
  }

  if (!session || !leagues?.length) {
    return <CreateFirstLeague />;
  }

  return (
    <Select.Root
      key={JSON.stringify(leagues)}
      defaultValue={leagues[0]?.slug}
      onValueChange={(value) =>
        value === "create-new"
          ? router.push("/league/new")
          : router.push(`/league/${value}/questions`)
      }
    >
      <Select.Trigger
        className="flex h-9 w-[250px] items-center justify-between gap-2 
        rounded-md border bg-white/50 px-3 text-sm 
        border-gray-200 text-gray-600
        hover:bg-gray-50/50 hover:border-gray-300
        data-[state=open]:border-gray-300 data-[state=open]:bg-gray-50/50
        dark:bg-gray-900/50 dark:border-gray-800 dark:text-gray-400
        dark:hover:border-gray-700 dark:hover:bg-gray-800/50
        dark:data-[state=open]:border-gray-700 dark:data-[state=open]:bg-gray-800/50
        focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/20
        transition-colors"
      >
        <Select.Value placeholder="Select a league" />
        <Select.Icon className="text-gray-400 dark:text-gray-500">
          <ChevronDown />
        </Select.Icon>
      </Select.Trigger>

      <Select.Portal>
        <Select.Positioner sideOffset={4}>
          <Select.Popup
            className="z-[100] min-w-[250px] overflow-hidden rounded-md 
            border bg-white/50 backdrop-blur-xl p-1 
            shadow-lg shadow-gray-200/20
            animate-in fade-in-0 zoom-in-95 outline-none
            border-gray-200 dark:border-gray-800 dark:bg-gray-900/50
            dark:shadow-gray-900/20"
          >
            {leagues.map((league) => (
              <Select.Item
                key={league.id}
                value={league.slug}
                className="relative flex w-full cursor-default select-none items-center
                  rounded-sm px-2 py-1.5 text-sm outline-none
                  text-gray-600 data-[highlighted]:bg-gray-100/50 data-[selected]:text-gray-900
                  dark:text-gray-400 dark:data-[highlighted]:bg-gray-800/50 dark:data-[selected]:text-gray-200
                  data-[disabled]:opacity-50 data-[disabled]:pointer-events-none"
              >
                <Select.ItemText>{league.name}</Select.ItemText>
                <Select.ItemIndicator className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
                  <Check className="text-blue-500/70 dark:text-blue-400/70" />
                </Select.ItemIndicator>
              </Select.Item>
            ))}

            <div className="my-1 h-px bg-gray-200 dark:bg-gray-800 select-none outline-none pointer-events-none" />

            <Select.Item
              value="create-new"
              className="relative flex w-full cursor-pointer select-none items-center
      rounded-sm px-2 py-1.5 text-sm outline-none
      text-blue-600 data-[highlighted]:bg-gray-100/50
      dark:text-blue-400 dark:data-[highlighted]:bg-gray-800/50
      data-[disabled]:opacity-50 data-[disabled]:pointer-events-none"
            >
              <Select.ItemText>Create New</Select.ItemText>
              <PlusCircle className="ml-auto h-3.5 w-3.5" />
            </Select.Item>
          </Select.Popup>
        </Select.Positioner>
      </Select.Portal>
    </Select.Root>
  );
}
