/*
  Warnings:

  - You are about to drop the column `leagueId` on the `Question` table. All the data in the column will be lost.
  - Added the required column `leagueSlug` to the `Question` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Question" DROP CONSTRAINT "Question_leagueId_fkey";

-- AlterTable
ALTER TABLE "Question" DROP COLUMN "leagueId",
ADD COLUMN     "leagueSlug" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_leagueSlug_fkey" FOREIGN KEY ("leagueSlug") REFERENCES "League"("slug") ON DELETE RESTRICT ON UPDATE CASCADE;
