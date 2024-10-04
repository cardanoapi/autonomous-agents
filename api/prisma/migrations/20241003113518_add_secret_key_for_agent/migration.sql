/*
  Warnings:

  - Added the required column `secret_key` to the `Agent` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "AgentWalletDetails" DROP CONSTRAINT "AgentWalletDetails_agent_id_fkey";

-- AlterTable
ALTER TABLE "Agent" ADD COLUMN     "secret_key" BYTEA NOT NULL;

-- AddForeignKey
ALTER TABLE "Agent" ADD CONSTRAINT "Agent_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "Template"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trigger" ADD CONSTRAINT "Trigger_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "Agent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentWalletDetails" ADD CONSTRAINT "AgentWalletDetails_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "Agent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
