/*
  Warnings:

  - You are about to drop the column `title` on the `Answer` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[questionId]` on the table `Answer` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `keywords` to the `Answer` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Answer" DROP COLUMN "title",
ADD COLUMN     "keywords" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Answer_questionId_key" ON "Answer"("questionId");
