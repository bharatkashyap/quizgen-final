"use client";
import * as React from "react";
import { Menu } from "@base-ui-components/react/menu";
import { signOut } from "next-auth/react";
import { User, LogOut } from "lucide-react";
import type { Session } from "next-auth";
import { LeagueSelector } from "./league-selector";

type AccountMenuProps = {
  session: Session;
};

export function AccountMenu({ session }: AccountMenuProps) {
  return (
    <Menu.Root>
      <Menu.Trigger className="h-8 w-8 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors">
        {session.user?.image ? (
          <img
            src={session.user.image}
            alt={session.user.name ?? "User"}
            className="h-8 w-8 rounded-full"
          />
        ) : (
          <User className="h-4 w-4" />
        )}
      </Menu.Trigger>

      <Menu.Portal>
        <Menu.Positioner sideOffset={8}>
          <Menu.Popup
            className="min-w-[220px] rounded-md p-2 
            bg-white/50 dark:bg-gray-900/50 
            border border-gray-200 dark:border-gray-800
            shadow-sm backdrop-blur-sm
            focus:outline-none"
          >
            <div className="px-2 py-1.5 border-b mb-1">
              <p className="text-sm font-medium">{session.user?.name}</p>
              <p className="text-xs text-muted-foreground">
                {session.user?.email}
              </p>
            </div>

            <Menu.Group>
              <Menu.GroupLabel className="m-2 text-xs">League</Menu.GroupLabel>
              <LeagueSelector />
              <Menu.Separator className="my-2 mx-1 h-px bg-gray-800" />
            </Menu.Group>
            <Menu.Item
              onClick={() => signOut()}
              className="text-sm px-2 py-1.5 flex items-center gap-2               
                       text-red-600 dark:text-red-400 
                       hover:bg-red-100 dark:hover:bg-red-900/50
                       outline-none cursor-pointer rounded-sm"
            >
              <LogOut className="h-4 w-4" />
              Log out
            </Menu.Item>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}
