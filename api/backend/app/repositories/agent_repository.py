import binascii
import hashlib
import json
import os
import uuid
from datetime import datetime, timezone, timedelta
from typing import List, Optional

import pycardano
from fastapi import HTTPException
from pycardano import (
    HDWallet,
    PaymentSigningKey,
    PaymentVerificationKey,
    StakeSigningKey,
    StakeVerificationKey,
    Address,
    Network,
)
from pycardano.crypto.bech32 import bech32_encode, convertbits, Encoding

from backend.app.models import AgentResponse, AgentCreateDTO, AgentKeyResponse
from backend.config.database import prisma_connection


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
        hd_wallet = HDWallet.from_mnemonic(mnemonic)

        derived_wallet = hd_wallet.derive(agent_index, hardened=True)
        agent_private_key = derived_wallet.xprivate_key
        agent_public_key = derived_wallet.public_key
        agent_chain_code = derived_wallet.chain_code

        # Derive the agent's child private key based on the agent_id

        # agentPath = f"m/{agent_index}'"
        # agent_key = masterKey.derive_from_path(agentPath)
        #
        # Generate the address using the derived agent key
        paymentPath = "m/1852'/1815'/0'/0/0"
        stakingPath = "m/1852'/1815'/0'/2/0"

        paymentKeys = derived_wallet.derive_from_path(paymentPath)
        paymentSigningKey = PaymentSigningKey(paymentKeys.xprivate_key[:32])
        paymentVerificationKey = PaymentVerificationKey.from_signing_key(paymentSigningKey)

        stakingKeys = derived_wallet.derive_from_path(stakingPath)
        stakeSigningKey = StakeSigningKey(stakingKeys.xprivate_key[:32])
        stakeVerificationKey = StakeVerificationKey.from_signing_key(stakeSigningKey)

        stake_verification_key_dict = json.loads(str(stakeVerificationKey))
        drep_id_bech32, drep_id = self.encode_drep_id(stake_verification_key_dict)
        print(f"dRep ID Bech32 Address: {drep_id_bech32}", "drep_id", drep_id)

        print(
            "paymentSigningKey:",
            paymentSigningKey,
            "payment verification key:",
            paymentVerificationKey,
            "stakeVerificationKey",
            stakeVerificationKey,
        )

        address = pycardano.Address(
            payment_part=paymentVerificationKey.hash(),
            staking_part=stakeVerificationKey.hash(),
            network=pycardano.Network.TESTNET,
        )
        # spk = stakeVerificationKey.to_cbor_hex()
        # stake_verification_key_bytes = bytes.fromhex(spk[4:])
        #
        # # Convert the bytes to a 5-bit array
        # witprog = convertbits(stake_verification_key_bytes, 8, 5)
        # if witprog is None:
        #     raise ValueError("Failed to convert bits")
        #
        # drep_key = bech32_encode("drep", witprog, Encoding.BECH32)
        # print(drep_key)

        # Create and return the AgentResponse with the agent's key and address
        agent_response = AgentKeyResponse(
            payment_signing_key=str(paymentSigningKey.to_cbor_hex()),
            stake_signing_key=str(stakeSigningKey.to_cbor_hex()),
            agent_private_key=str(paymentSigningKey.to_cbor_hex()),
            agent_address=str(address),
            stake_verification_key_hash=str(stakeVerificationKey.hash()),
            payment_verification_key_hash=str(paymentVerificationKey.hash()),
            drep_id=str(drep_id),
        )
        return agent_response

    def blake2b_28(self, data):
        """Compute the BLAKE2b hash of the given data with a 28-byte output length."""
        hasher = hashlib.blake2b(digest_size=28)
        hasher.update(data)
        return hasher.digest()

    def encode_drep_id(self, stake_verification_key_dict):
        """Encode the stake verification key into a dRep Bech32 address."""
        # Extract the cborHex value
        cbor_hex = stake_verification_key_dict["cborHex"]

        # Convert the hex string to bytes (skip the first 4 characters which indicate the length and type)
        stake_verification_key_bytes = binascii.unhexlify(cbor_hex[4:])

        # Hash the bytes using BLAKE2b with a 28-byte output
        drep_id = self.blake2b_28(stake_verification_key_bytes)

        # Convert the hashed bytes to a 5-bit array (Bech32 words)
        words = convertbits(drep_id, 8, 5)

        # Encode the 5-bit array into a Bech32 address with HRP "drep"
        drep_id_bech32 = bech32_encode("drep", words, Encoding.BECH32)
        return drep_id_bech32, drep_id.hex()
