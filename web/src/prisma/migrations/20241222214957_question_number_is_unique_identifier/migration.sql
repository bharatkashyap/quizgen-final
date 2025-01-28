/*
  Warnings:

  - A unique constraint covering the columns `[number]` on the table `Question` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Question_number_key" ON "Question"("number");
