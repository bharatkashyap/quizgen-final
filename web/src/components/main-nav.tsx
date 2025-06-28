import { LeagueSelector } from "./league-selector";
import { auth } from "../lib/auth";
import { AccountMenu } from "./account-menu";
import { LeagueTitle } from "./league-title";

export async function MainNav() {
  const session = await auth();

  return (
    <nav className="border-b bg-background/80 backdrop-blur-sm z-50">
      <div className="container mx-auto px-4 h-14 grid grid-cols-3 items-center">
        <div className="flex items-center space-x-6">
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500">
            Quizgen
          </span>
          <div className="hidden lg:block">
            <LeagueSelector />
          </div>
        </div>
        <div className="flex justify-center">
          <LeagueTitle />
        </div>
        <div className="flex justify-end items-center space-x-4">
          {session ? (
            <AccountMenu session={session} />
          ) : (
            <div className="block lg:hidden">
              <LeagueSelector />
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
