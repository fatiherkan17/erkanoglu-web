-- CreateTable
CREATE TABLE "QuoteStatusHistory" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "quoteId" INTEGER NOT NULL,
    "fromStatus" TEXT,
    "toStatus" TEXT NOT NULL,
    "changedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "QuoteStatusHistory_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "Quote" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "QuoteStatusHistory_quoteId_idx" ON "QuoteStatusHistory"("quoteId");

-- CreateIndex
CREATE INDEX "QuoteStatusHistory_changedAt_idx" ON "QuoteStatusHistory"("changedAt");
