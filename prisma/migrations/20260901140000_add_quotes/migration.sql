CREATE TABLE "Quote" (
  "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  "projectId" INTEGER NOT NULL,
  "quoteNo" TEXT NOT NULL,
  "quoteDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "validUntil" DATETIME,
  "scope" TEXT NOT NULL,
  "description" TEXT,
  "subtotal" INTEGER NOT NULL,
  "vatRate" INTEGER NOT NULL DEFAULT 20,
  "total" INTEGER NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'TRY',
  "status" TEXT NOT NULL DEFAULT 'TASLAK',
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Quote_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "Quote_quoteNo_key" ON "Quote"("quoteNo");
CREATE INDEX "Quote_projectId_idx" ON "Quote"("projectId");
CREATE INDEX "Quote_quoteDate_idx" ON "Quote"("quoteDate");
CREATE INDEX "Quote_status_idx" ON "Quote"("status");
