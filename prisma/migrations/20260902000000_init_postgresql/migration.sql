-- PostgreSQL baseline for the production database.

CREATE TABLE "ProjectRequest" (
    "id" SERIAL NOT NULL,
    "fullName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "province" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "neighborhood" TEXT NOT NULL,
    "buildingType" TEXT NOT NULL,
    "projectStage" TEXT NOT NULL,
    "approximateArea" TEXT,
    "interestAreas" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'YENI',
    "source" TEXT NOT NULL DEFAULT 'direct',
    "priority" TEXT NOT NULL DEFAULT 'NORMAL',
    "lastContactAt" TIMESTAMP(3),
    "nextFollowUpAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ProjectRequest_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Project" (
    "id" SERIAL NOT NULL,
    "projectNo" TEXT NOT NULL,
    "name" TEXT,
    "status" TEXT NOT NULL DEFAULT 'AKTIF',
    "published" BOOLEAN NOT NULL DEFAULT false,
    "category" TEXT NOT NULL DEFAULT 'KONUT',
    "publicTitle" TEXT,
    "publicSummary" TEXT,
    "coverImageUrl" TEXT,
    "galleryImages" TEXT,
    "projectRequestId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Project_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Project_projectRequestId_fkey" FOREIGN KEY ("projectRequestId") REFERENCES "ProjectRequest" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE "MeetingNote" (
    "id" SERIAL NOT NULL,
    "projectId" INTEGER NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'YUZ_YUZE',
    "note" TEXT NOT NULL,
    "meetingAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "MeetingNote_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "MeetingNote_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "Quote" (
    "id" SERIAL NOT NULL,
    "projectId" INTEGER NOT NULL,
    "quoteNo" TEXT NOT NULL,
    "quoteDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validUntil" TIMESTAMP(3),
    "scope" TEXT NOT NULL,
    "description" TEXT,
    "subtotal" INTEGER NOT NULL,
    "vatRate" INTEGER NOT NULL DEFAULT 20,
    "total" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'TRY',
    "status" TEXT NOT NULL DEFAULT 'TASLAK',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Quote_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Quote_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "QuoteStatusHistory" (
    "id" SERIAL NOT NULL,
    "quoteId" INTEGER NOT NULL,
    "fromStatus" TEXT,
    "toStatus" TEXT NOT NULL,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "QuoteStatusHistory_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "QuoteStatusHistory_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "Quote" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "Project_projectNo_key" ON "Project"("projectNo");
CREATE UNIQUE INDEX "Project_projectRequestId_key" ON "Project"("projectRequestId");
CREATE INDEX "ProjectRequest_status_idx" ON "ProjectRequest"("status");
CREATE INDEX "ProjectRequest_priority_idx" ON "ProjectRequest"("priority");
CREATE INDEX "ProjectRequest_nextFollowUpAt_idx" ON "ProjectRequest"("nextFollowUpAt");
CREATE INDEX "MeetingNote_projectId_idx" ON "MeetingNote"("projectId");
CREATE INDEX "MeetingNote_meetingAt_idx" ON "MeetingNote"("meetingAt");
CREATE UNIQUE INDEX "Quote_quoteNo_key" ON "Quote"("quoteNo");
CREATE INDEX "Quote_projectId_idx" ON "Quote"("projectId");
CREATE INDEX "Quote_quoteDate_idx" ON "Quote"("quoteDate");
CREATE INDEX "Quote_status_idx" ON "Quote"("status");
CREATE INDEX "QuoteStatusHistory_quoteId_idx" ON "QuoteStatusHistory"("quoteId");
CREATE INDEX "QuoteStatusHistory_changedAt_idx" ON "QuoteStatusHistory"("changedAt");
