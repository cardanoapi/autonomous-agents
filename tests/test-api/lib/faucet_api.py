import os
import requests


class CardanoFaucet:

    def __init__(
        self,
        api_key: str,
        base_url: str = "https://faucet.sanchonet.world.dev.cardano.org",
    ) -> None:
        self.api_key = api_key
        self.base_url = base_url

    @staticmethod
    def from_env():
        api_key = os.environ.get("CARDANO_FAUCET_API_KEY")
        base_url = os.environ.get("CARDANO_FAUCET_BASE_URL")
        if not api_key:
            raise ValueError("CARDANO_FAUCET_API_KEY is not set")
        if not base_url:
            raise ValueError("CARDANO_FAUCET_BASE_URL is not set")

        return CardanoFaucet(api_key, base_url)

    def load_funds(self, address: str, tx_type: str = "default"):
        endpoint = f"{self.base_url}/send-money"
        params = {"address": address, "api_key": self.api_key, "type": tx_type}
        response = requests.get(endpoint, params=params)

        if response.status_code == 200:
            return response
        else:
            raise Exception(response.json())
