/*
  Warnings:

  - You are about to drop the `File` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "File";

-- CreateTable
CREATE TABLE "Solicitation" (
    "id" SERIAL NOT NULL,
    "solicitationId" INTEGER NOT NULL,
    "solicitationNumber" TEXT,
    "title" TEXT,
    "agency" TEXT,
    "program" TEXT,
    "phase" TEXT,
    "branch" TEXT,
    "year" INTEGER,
    "releaseDate" TIMESTAMP(3),
    "openDate" TIMESTAMP(3),
    "closeDate" TIMESTAMP(3),
    "status" TEXT,
    "agencyUrl" TEXT,
    "rawJson" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Solicitation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Solicitation_solicitationId_key" ON "Solicitation"("solicitationId");
