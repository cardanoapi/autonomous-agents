/*
  Warnings:

  - Made the column `triggerType` on table `TriggerHistory` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "TriggerHistory" ALTER COLUMN "triggerType" SET NOT NULL;
