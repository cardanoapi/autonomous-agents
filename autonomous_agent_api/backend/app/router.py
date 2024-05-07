"""Application configuration - root APIRouter.

Defines all FastAPI application endpoints.

Resources:
    1. https://fastapi.tiangolo.com/tutorial/bigger-applications
"""

from fastapi import APIRouter

from backend.app.controllers import (
    ready,
    demo,
    agent_router,
    trigger_router,
    websocket_router,
)

root_api_router = APIRouter(prefix="/api")

# For ready status Api
root_api_router.include_router(ready.router, tags=["ready"])

# For Demo Ping APi
root_api_router.include_router(demo.router, tags=["test"])

# For Agent CRUD operations
root_api_router.include_router(agent_router.AgentRouter().router, tags=["agent"])

# For Agent Websocket connection
# root_api_router.include_router(websocket_router.router)

# For Agent Trigger
root_api_router.include_router(trigger_router.TriggerRouter().router, tags=["trigger"])
