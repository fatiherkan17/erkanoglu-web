-- Add public portfolio fields to Project
ALTER TABLE "Project" ADD COLUMN "published" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Project" ADD COLUMN "category" TEXT NOT NULL DEFAULT 'KONUT';
ALTER TABLE "Project" ADD COLUMN "publicTitle" TEXT;
ALTER TABLE "Project" ADD COLUMN "publicSummary" TEXT;
ALTER TABLE "Project" ADD COLUMN "coverImageUrl" TEXT;
ALTER TABLE "Project" ADD COLUMN "galleryImages" TEXT;
