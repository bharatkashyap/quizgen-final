"use client";
import * as React from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function GetStarted() {
  const { data: session } = useSession();
  const router = useRouter();
  const handleGetStarted = async () => {
    if (!session) {
      await signIn("google", { callbackUrl: "/league" });
      return;
    }
    router.push("/leagues");
  };

  return (
    <button
      onClick={handleGetStarted}
      className="h-12 px-8
              bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 
              text-white font-medium text-md rounded-md shadow-lg
              transition-all duration-300 ease-out              
              hover:shadow-xl hover:scale-105
              active:scale-95
              animate-shimmer bg-[length:200%_100%]
              group relative overflow-hidden"
    >
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100
                    bg-gradient-to-r from-transparent via-white/25 to-transparent
                    translate-x-[-100%] group-hover:translate-x-[100%]
                    transition-all duration-1000 ease-out"
      />
      Get Started
    </button>
  );
}
