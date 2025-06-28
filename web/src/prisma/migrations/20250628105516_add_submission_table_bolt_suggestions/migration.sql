/*
  Warnings:

  - You are about to drop the column `leagueSlug` on the `Answer` table. All the data in the column will be lost.
  - You are about to drop the column `questionNumber` on the `Answer` table. All the data in the column will be lost.
  - You are about to drop the column `leagueSlug` on the `Question` table. All the data in the column will be lost.
  - You are about to drop the `UserAnswer` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ViewedAnswer` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[questionId]` on the table `Answer` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[leagueId,number]` on the table `Question` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `leagueId` to the `Answer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `questionId` to the `Answer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `leagueId` to the `Question` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Answer" DROP CONSTRAINT "Answer_leagueSlug_questionNumber_fkey";

-- DropForeignKey
ALTER TABLE "Dispute" DROP CONSTRAINT "Dispute_answerId_fkey";

-- DropForeignKey
ALTER TABLE "Dispute" DROP CONSTRAINT "Dispute_userId_fkey";

-- DropForeignKey
ALTER TABLE "League" DROP CONSTRAINT "League_creatorId_fkey";

-- DropForeignKey
ALTER TABLE "LeagueSubscription" DROP CONSTRAINT "LeagueSubscription_leagueId_fkey";

-- DropForeignKey
ALTER TABLE "LeagueSubscription" DROP CONSTRAINT "LeagueSubscription_userId_fkey";

-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_userId_fkey";

-- DropForeignKey
ALTER TABLE "Question" DROP CONSTRAINT "Question_creatorId_fkey";

-- DropForeignKey
ALTER TABLE "Question" DROP CONSTRAINT "Question_leagueSlug_fkey";

-- DropForeignKey
ALTER TABLE "UserAnswer" DROP CONSTRAINT "UserAnswer_answerId_fkey";

-- DropForeignKey
ALTER TABLE "UserAnswer" DROP CONSTRAINT "UserAnswer_userId_fkey";

-- DropForeignKey
ALTER TABLE "ViewedAnswer" DROP CONSTRAINT "ViewedAnswer_answerId_fkey";

-- DropForeignKey
ALTER TABLE "ViewedAnswer" DROP CONSTRAINT "ViewedAnswer_userId_fkey";

-- DropIndex
DROP INDEX "Answer_leagueSlug_questionNumber_key";

-- DropIndex
DROP INDEX "Question_leagueSlug_number_key";

-- DropIndex
DROP INDEX "Question_number_key";

-- AlterTable
ALTER TABLE "Answer" DROP COLUMN "leagueSlug",
DROP COLUMN "questionNumber",
ADD COLUMN     "leagueId" TEXT NOT NULL,
ADD COLUMN     "questionId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Question" DROP COLUMN "leagueSlug",
ADD COLUMN     "leagueId" TEXT NOT NULL;

-- DropTable
DROP TABLE "UserAnswer";

-- DropTable
DROP TABLE "ViewedAnswer";

-- CreateTable
CREATE TABLE "Submission" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "isCorrect" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "answerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Submission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Submission_userId_idx" ON "Submission"("userId");

-- CreateIndex
CREATE INDEX "Submission_questionId_idx" ON "Submission"("questionId");

-- CreateIndex
CREATE INDEX "Submission_answerId_idx" ON "Submission"("answerId");

-- CreateIndex
CREATE INDEX "Submission_isCorrect_idx" ON "Submission"("isCorrect");

-- CreateIndex
CREATE UNIQUE INDEX "Submission_userId_questionId_key" ON "Submission"("userId", "questionId");

-- CreateIndex
CREATE INDEX "Account_userId_idx" ON "Account"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Answer_questionId_key" ON "Answer"("questionId");

-- CreateIndex
CREATE INDEX "Answer_creatorId_idx" ON "Answer"("creatorId");

-- CreateIndex
CREATE INDEX "Answer_leagueId_idx" ON "Answer"("leagueId");

-- CreateIndex
CREATE INDEX "Dispute_userId_idx" ON "Dispute"("userId");

-- CreateIndex
CREATE INDEX "Dispute_answerId_idx" ON "Dispute"("answerId");

-- CreateIndex
CREATE INDEX "Dispute_status_idx" ON "Dispute"("status");

-- CreateIndex
CREATE INDEX "League_creatorId_idx" ON "League"("creatorId");

-- CreateIndex
CREATE INDEX "League_isPrivate_idx" ON "League"("isPrivate");

-- CreateIndex
CREATE INDEX "LeagueSubscription_userId_idx" ON "LeagueSubscription"("userId");

-- CreateIndex
CREATE INDEX "LeagueSubscription_leagueId_idx" ON "LeagueSubscription"("leagueId");

-- CreateIndex
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");

-- CreateIndex
CREATE INDEX "Notification_read_idx" ON "Notification"("read");

-- CreateIndex
CREATE INDEX "Notification_type_idx" ON "Notification"("type");

-- CreateIndex
CREATE INDEX "Question_creatorId_idx" ON "Question"("creatorId");

-- CreateIndex
CREATE INDEX "Question_leagueId_idx" ON "Question"("leagueId");

-- CreateIndex
CREATE INDEX "Question_draft_idx" ON "Question"("draft");

-- CreateIndex
CREATE INDEX "Question_genre_idx" ON "Question"("genre");

-- CreateIndex
CREATE UNIQUE INDEX "Question_leagueId_number_key" ON "Question"("leagueId", "number");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- AddForeignKey
ALTER TABLE "League" ADD CONSTRAINT "League_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeagueSubscription" ADD CONSTRAINT "LeagueSubscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeagueSubscription" ADD CONSTRAINT "LeagueSubscription_leagueId_fkey" FOREIGN KEY ("leagueId") REFERENCES "League"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_leagueId_fkey" FOREIGN KEY ("leagueId") REFERENCES "League"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Answer" ADD CONSTRAINT "Answer_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Answer" ADD CONSTRAINT "Answer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Answer" ADD CONSTRAINT "Answer_leagueId_fkey" FOREIGN KEY ("leagueId") REFERENCES "League"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_answerId_fkey" FOREIGN KEY ("answerId") REFERENCES "Answer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dispute" ADD CONSTRAINT "Dispute_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dispute" ADD CONSTRAINT "Dispute_answerId_fkey" FOREIGN KEY ("answerId") REFERENCES "Answer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
