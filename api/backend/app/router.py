"""Application configuration - root APIRouter.

Defines all FastAPI application endpoints.

Resources:
    1. https://fastapi.tiangolo.com/tutorial/bigger-applications
"""

from fastapi import APIRouter

from backend.app.controllers.internal import proposal_router, drep_router, metadata_router
from backend.app.controllers import (
    ready,
    demo,
    agent_router,
    trigger_router,
    websocket_router,
    template_router,
    template_trigger_router,
    function_router,
    trigger_history_router,
    auth_router,
)

root_api_router = APIRouter(prefix="/api")

# For ready status Api
root_api_router.include_router(ready.router, tags=["ready"])

# For Demo Ping APi
root_api_router.include_router(demo.router, tags=["Test"])

# For Agent CRUD operations
root_api_router.include_router(agent_router.AgentRouter().router, tags=["Agent"])

# For Agent Websocket connection
# root_api_router.include_router(websocket_router.router)

# For Agent Trigger
root_api_router.include_router(trigger_router.TriggerRouter().router, tags=["Trigger"])


# For Template
root_api_router.include_router(template_router.TemplateRouter().router, tags=["Template"])
# For Template Trigger
root_api_router.include_router(template_trigger_router.TemplateTriggerRouter().router, tags=["Template Trigger"])
# For Function

root_api_router.include_router(
    function_router.AgentFunctionDetailRouter().router, tags=["Agent function"], prefix="/agents"
)

# for trigger history
root_api_router.include_router(trigger_history_router.TriggerHistory().router, tags=["Trigger History"])

# for authentication
root_api_router.include_router(auth_router.AuthRouter().router, tags=["Authentication"], prefix="/auth")


root_api_router.include_router(proposal_router.ProposalRouter().router, tags=["Proposal Router"])

root_api_router.include_router(drep_router.DrepRouter().router, tags=["Drep Router"])

root_api_router.include_router(metadata_router.MetadataRouter().router, tags=["Metadata Router"])
