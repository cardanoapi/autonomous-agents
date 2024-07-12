/*
  Warnings:

  - You are about to drop the column `address` on the `User` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "User_address_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "address";
