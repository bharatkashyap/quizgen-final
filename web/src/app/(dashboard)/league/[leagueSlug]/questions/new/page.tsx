import QuestionNav from "../../../../../../components/question-nav";
import QuestionEditor from "../../../../../../components/question-editor";

export default async function QuestionListPage({
  params,
}: {
  params: Promise<{ leagueSlug: string }>;
}) {
  const slug = (await params).leagueSlug;
  return (
    <>
      <QuestionNav leagueSlug={slug} />
      <QuestionEditor leagueSlug={slug} />
    </>
  );
}
