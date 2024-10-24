import base64
import os
from typing import List

import pycardano
from pycardano import HDWallet, PaymentSigningKey, PaymentVerificationKey, StakeSigningKey, StakeVerificationKey

from backend.app.models import AgentResponse
from backend.app.models.agent.agent_instance_wallet import AgentInstanceWallet
from backend.app.repositories.agent_instance_wallet_repository import AgentInstanceWalletRepository

rootKey = None


def get_root_key():
    global rootKey
    if rootKey is None:
        mnemonic = os.getenv("AGENT_MNEMONIC")

        rootKey = HDWallet.from_mnemonic(mnemonic)
    return rootKey


def get_agent_wallet(agent_index: int):
    hd_wallet = get_root_key()
    return hd_wallet.derive(agent_index, hardened=True)


def get_wallet_account(walletKey, account_index):
    payment_path = f"m/1852'/1815'/{account_index}'/0/0"
    staking_path = f"m/1852'/1815'/{account_index}'/2/0"

    payment_key = walletKey.derive_from_path(payment_path)
    payment_signing_key = PaymentSigningKey(payment_key.xprivate_key[:32])
    payment_verification_key = PaymentVerificationKey.from_signing_key(payment_signing_key)

    staking_key = walletKey.derive_from_path(staking_path)
    stake_signing_key = StakeSigningKey(staking_key.xprivate_key[:32])
    stake_verification_key = StakeVerificationKey.from_signing_key(stake_signing_key)
    pkh = payment_verification_key.hash()
    stakeKh = stake_verification_key.hash()
    address = pycardano.Address(
        payment_part=pkh,
        staking_part=stakeKh,
        network=pycardano.Network.TESTNET,
    )
    return {
        "address": str(address),
        "stake_key_hash": base64.b64encode(stakeKh.payload).decode("utf-8"),
        "payment_key_hash": base64.b64encode(pkh.payload).decode("utf-8"),
    }


class AgentInstanceWalletService:

    def __init__(self, agent_instance_wallet_repo: AgentInstanceWalletRepository):
        self.agent_instance_wallet_repo = agent_instance_wallet_repo

    async def create_wallet(self, agent: AgentResponse):
        agent_wallet = get_agent_wallet(agent.index)
        wallet_details = [
            AgentInstanceWallet(
                **get_wallet_account(agent_wallet, instance), agent_id=agent.id, instance_index=instance
            )
            for instance in range(agent.instance)
        ]
        return await self.agent_instance_wallet_repo.create_wallets(wallet_details)

    async def delete_wallet(self, agent_id: str):
        await self.agent_instance_wallet_repo.delete_wallets(agent_id)

    async def update_wallet(self, agent: AgentResponse, updating_wallet_instance: int):
        agent_wallet = get_agent_wallet(agent.index)
        wallet_details = [
            AgentInstanceWallet(
                **get_wallet_account(agent_wallet, instance + agent.instance),
                agent_id=agent.id,
                instance_index=instance + agent.instance,
            )
            for instance in range(updating_wallet_instance)
        ]
        return await self.agent_instance_wallet_repo.create_wallets(wallet_details)

    async def get_wallets(self, agent_id: str) -> List[AgentInstanceWallet]:
        wallets = await self.agent_instance_wallet_repo.get_wallets(agent_id)
        for wallet in wallets:
            wallet.payment_key_hash = base64.b64decode(wallet.payment_key_hash._raw).hex()
            wallet.stake_key_hash = base64.b64decode(wallet.stake_key_hash._raw).hex()
        return [AgentInstanceWallet(**wallet.dict()) for wallet in wallets]
