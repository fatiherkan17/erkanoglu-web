/*
  Warnings:

  - You are about to drop the column `location` on the `ProjectRequest` table. All the data in the column will be lost.
  - Added the required column `district` to the `ProjectRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `neighborhood` to the `ProjectRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `province` to the `ProjectRequest` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ProjectRequest" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
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
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_ProjectRequest" ("approximateArea", "buildingType", "createdAt", "description", "fullName", "id", "interestAreas", "phone", "projectStage", "status", "updatedAt") SELECT "approximateArea", "buildingType", "createdAt", "description", "fullName", "id", "interestAreas", "phone", "projectStage", "status", "updatedAt" FROM "ProjectRequest";
DROP TABLE "ProjectRequest";
ALTER TABLE "new_ProjectRequest" RENAME TO "ProjectRequest";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
