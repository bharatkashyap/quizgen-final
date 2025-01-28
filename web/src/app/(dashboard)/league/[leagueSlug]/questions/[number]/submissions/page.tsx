import * as React from "react";
import QuestionNav from "../../../../../../../components/question-nav";
import SubmissionsTable from "../../../../../../../components/submissions-table";

export default async function QuestionPage({
  params,
}: {
  params: Promise<{ leagueSlug: string; number: string }>;
}) {
  const { leagueSlug: slug, number } = await params;
  return (
    <>
      <QuestionNav leagueSlug={slug} number={number} />
      <SubmissionsTable leagueSlug={slug} questionNumber={number} />
    </>
  );
}
