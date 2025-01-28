import * as React from "react";
import QuestionNav from "../../../../../../components/question-nav";
import QuestionEditor from "../../../../../../components/question-editor";

export default async function QuestionPage({
  params,
}: {
  params: Promise<{ leagueSlug: string; number: string }>;
}) {
  const { leagueSlug: slug, number } = await params;
  return (
    <>
      <QuestionNav leagueSlug={slug} number={number} />
      <QuestionEditor number={number} leagueSlug={slug} />
    </>
  );
}
