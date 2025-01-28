"use client";

import * as React from "react";

export default function ErrorBoundary({
  error,
}: {
  error: Error & { digest?: string };
}) {
  return (
    <div className="fixed inset-x-0 my-auto p-4">
      <div className="rounded-lg bg-red-50 border border-red-200 p-4 max-w-xl mx-auto">
        <div className="flex gap-3">
          <div className="flex-1 space-y-1">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <p className="text-sm text-red-700">
              {error.message || "Something went wrong"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
