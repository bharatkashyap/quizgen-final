-- DropForeignKey
ALTER TABLE "Answer" DROP CONSTRAINT "Answer_leagueSlug_questionNumber_fkey";

-- AddForeignKey
ALTER TABLE "Answer" ADD CONSTRAINT "Answer_leagueSlug_questionNumber_fkey" FOREIGN KEY ("leagueSlug", "questionNumber") REFERENCES "Question"("leagueSlug", "number") ON DELETE CASCADE ON UPDATE CASCADE;
