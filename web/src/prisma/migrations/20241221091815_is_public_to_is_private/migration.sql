/*
  Warnings:

  - You are about to drop the column `isPublic` on the `League` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "League" DROP COLUMN "isPublic",
ADD COLUMN     "isPrivate" BOOLEAN NOT NULL DEFAULT false;
