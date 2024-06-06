/*
  Warnings:

  - Added the required column `message` to the `TriggerHistory` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TriggerHistory" ADD COLUMN     "message" TEXT NOT NULL;
