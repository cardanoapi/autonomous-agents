-- DropForeignKey
ALTER TABLE "AgentWalletDetails" DROP CONSTRAINT "AgentWalletDetails_agent_id_fkey";

-- AddForeignKey
ALTER TABLE "AgentWalletDetails" ADD CONSTRAINT "AgentWalletDetails_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "Agent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
