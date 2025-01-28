/*
  Warnings:

  - The `mediaType` column on the `Answer` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `mediaType` column on the `Question` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Answer" DROP COLUMN "mediaType",
ADD COLUMN     "mediaType" TEXT;

-- AlterTable
ALTER TABLE "Question" DROP COLUMN "mediaType",
ADD COLUMN     "mediaType" TEXT;

-- DropEnum
DROP TYPE "MediaType";
