/*
  Warnings:

  - Added the required column `secret_key` to the `Agent` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
-- Step 1: Add the column as nullable
ALTER TABLE "Agent" ADD COLUMN "secret_key" BYTEA;

-- Step 2: Update existing records with random Base64 values
UPDATE "Agent"
SET "secret_key" = decode('c2VjcmV0a2V5dmFsdWU', 'base64')
WHERE "secret_key" IS NULL;

-- Step 3: Alter the column to make it NOT NULL
ALTER TABLE "Agent" ALTER COLUMN "secret_key" SET NOT NULL;

