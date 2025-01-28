"use client";
import * as React from "react";
import { useRouter } from "next/navigation";

export default function LeagueNotFound() {
  const router = useRouter();
  return (
    <div className="text-center mt-12">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
        League not found
      </h2>
      <p className="mt-2 text-gray-600 dark:text-gray-400">
        The league you're looking for doesn't exist or you don't have permission
        to view it.
      </p>
      <button
        onClick={() => router.back()}
        className="mt-4 px-4 py-2 rounded-md border border-gray-200 
              dark:border-gray-800 bg-white/50 dark:bg-gray-900/50
              hover:bg-gray-50 dark:hover:bg-gray-800/50"
      >
        Go Back
      </button>
    </div>
  );
}
