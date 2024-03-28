"""Application configuration - root APIRouter.

Defines all FastAPI application endpoints.

Resources:
    1. https://fastapi.tiangolo.com/tutorial/bigger-applications

"""
from fastapi import APIRouter
from backend.app.controllers import ready, demo, agent_router

root_api_router = APIRouter(prefix="/api")

root_api_router.include_router(ready.router, tags=["ready"])

root_api_router.include_router(demo.router , tags=['test'])

root_api_router.include_router(agent_router.AgentRouter().router , tags=['agent'])