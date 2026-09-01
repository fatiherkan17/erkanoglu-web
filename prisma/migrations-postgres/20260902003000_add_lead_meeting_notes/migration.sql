-- Allow meeting notes to be created while a request is still a lead.
ALTER TABLE "MeetingNote" ALTER COLUMN "projectId" DROP NOT NULL;
ALTER TABLE "MeetingNote" ADD COLUMN "projectRequestId" INTEGER;

CREATE INDEX "MeetingNote_projectRequestId_idx" ON "MeetingNote"("projectRequestId");

ALTER TABLE "MeetingNote"
  ADD CONSTRAINT "MeetingNote_projectRequestId_fkey"
  FOREIGN KEY ("projectRequestId") REFERENCES "ProjectRequest"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
