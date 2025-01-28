import * as React from "react";
import type { DraftAnswer } from "../types";

export function AnswerPreview({
  title,
  subtitle,
  questionNumber,
  mediaUrl,
  pendingMedia,
}: DraftAnswer & { questionNumber?: string }) {
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);

  // Generate preview URL for pending media
  React.useEffect(() => {
    if (pendingMedia) {
      const url = URL.createObjectURL(pendingMedia);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [pendingMedia]);

  return (
    <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
      {questionNumber && (
        <div className="text-3xl text-center font-bold text-yellow-500 mb-6">
          {questionNumber}
        </div>
      )}
      <div className="text-center text-white">
        <h3 className="font-bold text-2xl mb-1">
          {title || "Enter a title..."}
        </h3>
        {subtitle && (
          <p className="text-sm text-center italic text-gray-300 my-2">
            {subtitle}
          </p>
        )}
        {(mediaUrl || previewUrl) && (
          <div className="aspect-video relative p-2">
            <img
              src={previewUrl || mediaUrl}
              alt={title}
              className="w-full h-full object-contain rounded-lg"
            />
            <div
              className="absolute inset-2 rounded-lg pointer-events-none shadow-[inset_0_-20px_30px_-20px_rgba(0,0,0,0.2),inset_0_20px_30px_-20px_rgba(0,0,0,0.2)]
                dark:shadow-[inset_0_-20px_30px_-20px_rgba(0,0,0,0.4),inset_0_20px_30px_-20px_rgba(0,0,0,0.4)]"
            />
          </div>
        )}
      </div>
    </div>
  );
}
