/*
  Warnings:

  - You are about to drop the column `questionId` on the `Answer` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[leagueSlug,questionNumber]` on the table `Answer` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[leagueSlug,number]` on the table `Question` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `leagueSlug` to the `Answer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `questionNumber` to the `Answer` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Answer" DROP CONSTRAINT "Answer_questionId_fkey";

-- DropIndex
DROP INDEX "Answer_questionId_key";

-- AlterTable
ALTER TABLE "Answer" DROP COLUMN "questionId",
ADD COLUMN     "leagueSlug" TEXT NOT NULL,
ADD COLUMN     "questionNumber" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Answer_leagueSlug_questionNumber_key" ON "Answer"("leagueSlug", "questionNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Question_leagueSlug_number_key" ON "Question"("leagueSlug", "number");

-- AddForeignKey
ALTER TABLE "Answer" ADD CONSTRAINT "Answer_leagueSlug_questionNumber_fkey" FOREIGN KEY ("leagueSlug", "questionNumber") REFERENCES "Question"("leagueSlug", "number") ON DELETE RESTRICT ON UPDATE CASCADE;
