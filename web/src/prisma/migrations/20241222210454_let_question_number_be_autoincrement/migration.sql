/*
  Warnings:

  - You are about to drop the column `publishedAt` on the `Question` table. All the data in the column will be lost.

*/
-- AlterTable
CREATE SEQUENCE question_number_seq;
ALTER TABLE "Question" DROP COLUMN "publishedAt",
ALTER COLUMN "number" SET DEFAULT nextval('question_number_seq');
ALTER SEQUENCE question_number_seq OWNED BY "Question"."number";
