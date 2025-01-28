import * as React from "react";
import QuestionNav from "../../../../../../../components/question-nav";
import AnswerEditor from "../../../../../../../components/answer-editor";

export default async function QuestionPage({
  params,
}: {
  params: Promise<{ leagueSlug: string; number: string }>;
}) {
  const { leagueSlug: slug, number } = await params;
  return (
    <>
      <QuestionNav leagueSlug={slug} number={number} />
      <AnswerEditor leagueSlug={slug} />
    </>
  );
}
