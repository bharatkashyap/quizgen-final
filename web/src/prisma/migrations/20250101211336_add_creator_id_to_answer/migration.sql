/*
  Warnings:

  - Added the required column `creatorId` to the `Answer` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Answer" ADD COLUMN     "creatorId" TEXT NOT NULL;
