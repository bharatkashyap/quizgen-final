import * as React from "react";
import QuestionContent from "../../../../../../components/question-content";
import QuestionSubmission from "../../../../../../components/question-submission";

export default async function QuestionListPage({
  params,
}: {
  params: Promise<{ leagueSlug: string; number: string }>;
}) {
  const { leagueSlug, number } = await params;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-black text-white min-h-[300px] p-8 rounded-lg relative">
        <div className="text-5xl text-center font-bold text-yellow-500 mb-6">
          {number}
        </div>
        <QuestionContent leagueSlug={leagueSlug} number={number} />
        <QuestionSubmission
          leagueSlug={leagueSlug}
          number={number}
          // These props will come from your data fetching logic
          isLocked={false}
          lastSubmission=""
          correctAnswer="Example answer"
        />
      </div>
    </div>
  );
}
