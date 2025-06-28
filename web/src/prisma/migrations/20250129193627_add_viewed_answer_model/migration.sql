-- CreateTable
CREATE TABLE "ViewedAnswer" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "answerId" TEXT NOT NULL,
    "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ViewedAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ViewedAnswer_userId_answerId_idx" ON "ViewedAnswer"("userId", "answerId");

-- CreateIndex
CREATE UNIQUE INDEX "ViewedAnswer_userId_answerId_key" ON "ViewedAnswer"("userId", "answerId");

-- AddForeignKey
ALTER TABLE "ViewedAnswer" ADD CONSTRAINT "ViewedAnswer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ViewedAnswer" ADD CONSTRAINT "ViewedAnswer_answerId_fkey" FOREIGN KEY ("answerId") REFERENCES "Answer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
