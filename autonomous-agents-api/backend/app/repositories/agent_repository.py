import os
import uuid
from datetime import datetime, timezone, timedelta
from typing import List, Optional

import pycardano
from fastapi import HTTPException
from pycardano import HDWallet

from backend.app.models import AgentResponse, AgentCreateDTO, AgentKeyResponse
from backend.config.database import prisma_connection
from backend.config.logger import logger


class AgentRepository:
    def __init__(self, db_connection=None):
        self.db = db_connection or prisma_connection

    async def save_agent(self, agent_data: AgentCreateDTO):
        # Generate a random UUID for the agent ID
        agent_id = str(uuid.uuid4())
        agent_data_dict = agent_data.dict()
        agent_data_dict["id"] = agent_id
        agent_data_dict["created_at"] = datetime.now(timezone.utc)
        agent_data_dict["updated_at"] = datetime.now(timezone.utc)
        agent = await self.db.prisma.agent.create(data=agent_data_dict)
        agent_response = AgentResponse(
            id=agent_id,
            name=agent_data.name,
            template_id=agent_data.template_id,
            instance=agent.instance,
            index=agent.index,
        )

        return agent_response

    async def retrieve_agents(self, page: int, limit: int) -> List[AgentResponse]:
        skip = (page - 1) * limit
        agents = await self.db.prisma.agent.find_many(where={"deleted_at": None}, skip=skip, take=limit)
        if not agents:
            raise HTTPException(status_code=404, detail="No Agents found")
        return agents

    async def retrieve_agent(self, agent_id: str) -> Optional[AgentResponse]:
        agent = await self.db.prisma.agent.find_first(where={"id": agent_id, "deleted_at": None})
        # threshold_time = datetime.utcnow() - timedelta(seconds=10)
        # online_agent = await self.db.prisma.agent.find_first(where={"id": agent_id,"last_active": {"gte": threshold_time}})
        # if online_agent:
        #     status = True
        # else:
        #     status = False

        if agent is None:
            raise HTTPException(status_code=404, detail="Agent not found")
        else:
            agent_response = AgentResponse(
                id=agent.id,
                name=agent.name,
                template_id=agent.template_id,
                instance=agent.instance,
                index=agent.index,
                last_active=agent.last_active,
            )
            return agent_response

    async def modify_agent(self, agent_id: str, agent_data: AgentCreateDTO) -> Optional[AgentResponse]:
        agent = await self.db.prisma.agent.find_first(where={"id": agent_id})
        if agent is None or agent.deleted_at is not None:
            raise HTTPException(status_code=404, detail="Agent not found")

        updated_data = agent_data.dict(exclude_unset=True)
        updated_data["updated_at"] = datetime.now(timezone.utc)

        updated_agent = await self.db.prisma.agent.update(where={"id": agent_id}, data=updated_data)
        return updated_agent

    async def get_online_agents_count(self):
        try:
            # Calculate the threshold for last active time (e.g., 10 seconds ago)
            threshold_time = datetime.utcnow() - timedelta(seconds=10)

            # Query the database for online agents
            online_agents_count = await self.db.prisma.agent.count(where={"last_active": {"gte": threshold_time}})

            return {"online_agents_count": online_agents_count}

        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to retrieve online agents count: {str(e)}",
            )

    async def remove_agent(self, agent_id: str) -> bool:
        agent = await self.db.prisma.agent.find_first(where={"id": agent_id})
        if agent is None:
            return False
        elif agent.deleted_at is not None:
            return True

        await self.db.prisma.agent.update(where={"id": agent_id}, data={"deleted_at": datetime.now(timezone.utc)})
        return True

    async def retreive_agent_key(self, agent_id: str):
        # Fetch the agent from the database or other data source based on the agent_id
        agent = await self.retrieve_agent(agent_id)
        agent_index = agent.index
        # Assuming you have the mnemonic stored securely
        mnemonic = os.getenv("AGENT_MNEMONIC")

        # Derive the root private key
        masterKey = HDWallet.from_mnemonic(mnemonic)

        # Derive the agent's child private key based on the agent_id

        agentPath = f"m/{agent_index}'"
        agent_key = masterKey.derive_from_path(agentPath)

        # Generate the address using the derived agent key
        paymentPath = "m/1852'/1815'/0'/0/0"
        stakingPath = "m/1852'/1815'/0'/2/0"

        paymentKeyPath = agent_key.derive_from_path(paymentPath)
        paymentPublicKey = paymentKeyPath.root_public_key

        stakingKeyPath = agent_key.derive_from_path(stakingPath)
        stakingPublicKey = stakingKeyPath.public_key

        paymentVerificationKey = pycardano.key.PaymentExtendedVerificationKey(paymentPublicKey)
        stakingVerificationKey = pycardano.key.StakeExtendedVerificationKey(stakingPublicKey)

        print(
            "payment public key:",
            paymentPublicKey.hex(),
            "staking public key: ",
            stakingPublicKey.hex(),
            "payment verification key: ",
            paymentVerificationKey.to_cbor_hex(),
            "staking verification key:",
            stakingVerificationKey.to_cbor_hex(),
        )

        address = pycardano.Address(
            payment_part=paymentVerificationKey.hash(),
            staking_part=stakingVerificationKey.hash(),
            network=pycardano.Network.TESTNET,
        )

        # Create and return the AgentResponse with the agent's key and address
        agent_response = AgentKeyResponse(
            agent_private_key=str(agent_key.xprivate_key.hex()),
            agent_address=str(address),
        )
        return agent_response