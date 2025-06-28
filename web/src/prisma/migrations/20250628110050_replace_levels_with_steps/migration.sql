/*
  Warnings:

  - The values [LEVELS] on the enum `UnlockMode` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "UnlockMode_new" AS ENUM ('STEPS', 'FREE', 'TIMED');
ALTER TABLE "League" ALTER COLUMN "unlockMode" DROP DEFAULT;
ALTER TABLE "League" ALTER COLUMN "unlockMode" TYPE "UnlockMode_new" USING ("unlockMode"::text::"UnlockMode_new");
ALTER TYPE "UnlockMode" RENAME TO "UnlockMode_old";
ALTER TYPE "UnlockMode_new" RENAME TO "UnlockMode";
DROP TYPE "UnlockMode_old";
ALTER TABLE "League" ALTER COLUMN "unlockMode" SET DEFAULT 'TIMED';
COMMIT;

-- AlterTable
ALTER TABLE "League" ALTER COLUMN "unlockMode" SET DEFAULT 'TIMED';
