/*
  Warnings:

  - You are about to drop the column `userId` on the `Agent` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Template` table. All the data in the column will be lost.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `User` table. All the data in the column will be lost.
  - Added the required column `address` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Agent" DROP CONSTRAINT "Agent_userId_fkey";

-- DropForeignKey
ALTER TABLE "Template" DROP CONSTRAINT "Template_userId_fkey";

-- AlterTable
ALTER TABLE "Agent" DROP COLUMN "userId",
ADD COLUMN     "userAddress" TEXT;

-- AlterTable
ALTER TABLE "Template" DROP COLUMN "userId",
ADD COLUMN     "userAddress" TEXT;

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
DROP COLUMN "id",
ADD COLUMN     "address" TEXT NOT NULL,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("address");

-- AddForeignKey
ALTER TABLE "Agent" ADD CONSTRAINT "Agent_userAddress_fkey" FOREIGN KEY ("userAddress") REFERENCES "User"("address") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Template" ADD CONSTRAINT "Template_userAddress_fkey" FOREIGN KEY ("userAddress") REFERENCES "User"("address") ON DELETE SET NULL ON UPDATE CASCADE;
