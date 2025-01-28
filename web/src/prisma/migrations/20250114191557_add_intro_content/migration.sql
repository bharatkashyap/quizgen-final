-- AlterTable
ALTER TABLE "League" ADD COLUMN     "introContent" TEXT,
ADD COLUMN     "showIntro" BOOLEAN NOT NULL DEFAULT true;
