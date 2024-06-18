from typing import List

from classy_fastapi import get, Routable
from fastapi import APIRouter

from backend.app.helper.function_metadata import functions_metadata
from backend.app.models.agent_function_details.agent_function_detail_dto import AgentFunctionDetailDto
from backend.app.services.function_services import AgentFunctionDetailService
from backend.dependency import function_service

router = APIRouter()


class AgentFunctionDetailRouter(Routable):
    def __init__(self, agent_service: AgentFunctionDetailService = function_service, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.agent_service = agent_service

    @get("/functions", response_model=List)
    async def get_all_functions(self):
        return functions_metadata

    @get("/functions/details", response_model=List[AgentFunctionDetailDto])
    async def get_all_functions_detail(self):
        return await self.agent_service.get_all_function_details()
