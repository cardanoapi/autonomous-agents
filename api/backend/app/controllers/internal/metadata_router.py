import aiohttp
from classy_fastapi import Routable, get

from backend.app.exceptions import HTTPException
from backend.config.api_settings import APISettings


class MetadataRouter(Routable):

    def __init__(self):
        super().__init__()
        self.metadata_api = APISettings().METADATA_API

    @get("/metadata")
    async def fetch_metadata(self, metadata_url: str):
        async with aiohttp.ClientSession() as session:
            async with session.get(
                f"{self.metadata_api}/metadata?url={metadata_url}&hash=1111111111111111111111111111111111111111111111111111111111111112"
            ) as resp:
                response = await resp.json()
                if resp.ok:
                    if response.get("hash"):
                        return response.get("hash")
                    else:
                        raise HTTPException(status_code=400, content="Not a valid url for metadata")
                else:
                    raise HTTPException(status_code=400, content="Not a valid url for metadata")
