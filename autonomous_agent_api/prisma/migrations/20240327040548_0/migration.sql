/*
  Warnings:

  - You are about to drop the `Test_Post` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Test_User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Test_Post";

-- DropTable
DROP TABLE "Test_User";

-- CreateTable
CREATE TABLE "Agent" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "action" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "triggers" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "Agent_pkey" PRIMARY KEY ("id")
);
