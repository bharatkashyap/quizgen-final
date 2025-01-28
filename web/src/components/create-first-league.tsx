"use client";
import * as React from "react";
import { signIn, useSession } from "next-auth/react";
import { PlusCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CreateFirstLeague() {
  const { data: session } = useSession();
  const router = useRouter();

  const handleCreateFirstLeague = async () => {
    if (!session) {
      await signIn("google", { callbackUrl: "/league/new" });
      return;
    }

    router.push("/league/new");
  };

  return (
    <button
      onClick={handleCreateFirstLeague}
      className="flex h-9 items-center gap-2  whitespace-nowrap text-sm text-muted-foreground hover:text-foreground transition-colors"
    >
      <PlusCircle className="h-4 w-4" />
      <span className="hidden sm:inline">Create your first league</span>
    </button>
  );
}
