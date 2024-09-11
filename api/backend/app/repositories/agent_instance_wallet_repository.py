from typing import List

from backend.app.models.agent.agent_instance_wallet import AgentInstanceWallet
from backend.config.database import prisma_connection


class AgentInstanceWalletRepository:
    def __init__(self, db_connection=None):
        self.db = db_connection or prisma_connection

    async def create_wallets(self, wallet_details: List[AgentInstanceWallet]):
        wallet_details_dict = [wallet.dict() for wallet in wallet_details]
        return await self.db.prisma.agentwalletdetails.create_many(data=wallet_details_dict, skip_duplicates=True)

    async def get_wallets(self, agent_id: str) -> List[AgentInstanceWallet]:
        return await self.db.prisma.agentwalletdetails.find_many(where={"agent_id": agent_id})

    async def delete_wallets(self, agent_id: str):
        return await self.db.prisma.agentwalletdetails.delete_many(where={"agent_id": agent_id})
