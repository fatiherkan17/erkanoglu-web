-- Add sales follow-up fields to ProjectRequest
ALTER TABLE "ProjectRequest" ADD COLUMN "source" TEXT NOT NULL DEFAULT 'direct';
ALTER TABLE "ProjectRequest" ADD COLUMN "priority" TEXT NOT NULL DEFAULT 'NORMAL';
ALTER TABLE "ProjectRequest" ADD COLUMN "lastContactAt" DATETIME;
ALTER TABLE "ProjectRequest" ADD COLUMN "nextFollowUpAt" DATETIME;

-- Index fields used by the lead list and follow-up workflow
CREATE INDEX "ProjectRequest_status_idx" ON "ProjectRequest"("status");
CREATE INDEX "ProjectRequest_priority_idx" ON "ProjectRequest"("priority");
CREATE INDEX "ProjectRequest_nextFollowUpAt_idx" ON "ProjectRequest"("nextFollowUpAt");
