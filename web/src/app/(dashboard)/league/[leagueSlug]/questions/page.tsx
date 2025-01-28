import { QuestionList } from "../../../../../components/question-list";

export default async function QuestionListPage({
  params,
}: {
  params: Promise<{ leagueSlug: string }>;
}) {
  const slug = (await params).leagueSlug;
  return <QuestionList leagueSlug={slug} />;
}
