-- CreateEnum
CREATE TYPE "UnlockMode" AS ENUM ('LEVELS', 'TIMED');

-- CreateEnum
CREATE TYPE "TimedUnlockInterval" AS ENUM ('DAILY', 'WEEKLY', 'CUSTOM');

-- AlterTable
ALTER TABLE "League" ADD COLUMN     "startDate" TIMESTAMP(3),
ADD COLUMN     "timedUnlockInterval" "TimedUnlockInterval",
ADD COLUMN     "unlockMode" "UnlockMode" NOT NULL DEFAULT 'LEVELS';

-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "unlockAt" TIMESTAMP(3);
