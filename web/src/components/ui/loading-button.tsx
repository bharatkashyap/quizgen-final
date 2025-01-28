"use client";
import * as React from "react";
import { useFormStatus } from "react-dom";

interface LoadingButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  loadingText?: string;
  children: React.ReactNode;
}

export function LoadingButton({
  loading = false,
  loadingText = "Loading...",
  children,
  className = "",
  ...props
}: LoadingButtonProps) {
  const { pending = false } = useFormStatus();
  return (
    <button
      {...props}
      disabled={pending || loading || props.disabled}
      className={`px-4 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {loading || pending ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          {loadingText}
        </span>
      ) : (
        children
      )}
    </button>
  );
}
