-- CreateTable
CREATE TABLE "AgentWalletDetails" (
    "address" TEXT NOT NULL,
    "agent_id" TEXT NOT NULL,
    "instance_index" INTEGER NOT NULL,
    "payment_key_hash" BYTEA NOT NULL,
    "stake_key_hash" BYTEA NOT NULL,

    CONSTRAINT "AgentWalletDetails_pkey" PRIMARY KEY ("address")
);

-- AddForeignKey
ALTER TABLE "AgentWalletDetails" ADD CONSTRAINT "AgentWalletDetails_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "Agent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
