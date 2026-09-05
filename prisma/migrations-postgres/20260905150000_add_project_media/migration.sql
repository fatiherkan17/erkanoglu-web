CREATE TABLE "ProjectMedia" (
  "id" SERIAL NOT NULL,
  "projectId" INTEGER NOT NULL,
  "url" TEXT NOT NULL,
  "pathname" TEXT NOT NULL,
  "originalName" TEXT NOT NULL,
  "contentType" TEXT NOT NULL,
  "size" INTEGER NOT NULL,
  "placement" TEXT NOT NULL DEFAULT 'BEKLEMEDE',
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ProjectMedia_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ProjectMedia_projectId_idx" ON "ProjectMedia"("projectId");
CREATE INDEX "ProjectMedia_projectId_placement_idx" ON "ProjectMedia"("projectId", "placement");

ALTER TABLE "ProjectMedia"
  ADD CONSTRAINT "ProjectMedia_projectId_fkey"
  FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
