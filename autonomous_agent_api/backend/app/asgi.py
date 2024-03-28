"""Application implementation - ASGI."""
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from backend.config import settings
from backend.app.router import root_api_router
from backend.config.logger import logger
from backend.app.utils import RedisClient, AiohttpClient

from backend.app.exceptions import (
    HTTPException,
    http_exception_handler,
)

from backend.config.database import prisma_connection

log = logging.getLogger(__name__)


# updated startup and shutdown event with lifespan event due to deprecation issue
@asynccontextmanager
async def lifespan(app: FastAPI):

    log.debug("Execute FastAPI startup event handler.")
    if settings.USE_REDIS:
        await RedisClient.open_redis_client()

    AiohttpClient.get_aiohttp_client()

    logger.info("Starting Server")

    await prisma_connection.connect()
    yield
    log.debug("Execute FastAPI shutdown event handler.")
    # Gracefully close utilities.
    if settings.USE_REDIS:
        await RedisClient.close_redis_client()

    await AiohttpClient.close_aiohttp_client()

    await prisma_connection.disconnect()
    logger.info("Stopping Server")




def get_application() -> FastAPI:
    """Initialize FastAPI application.

    Returns:
       FastAPI: Application object instance.

    """
    log.debug("Initialize FastAPI application node.")
    app = FastAPI(
        title=settings.PROJECT_NAME,
        debug=settings.DEBUG,
        version=settings.VERSION,
        docs_url=settings.DOCS_URL,
        # on_startup=[on_startup],
        # on_shutdown=[on_shutdown],
        lifespan = lifespan
    )
    log.debug("Add application routes.")
    app.include_router(root_api_router)
    log.debug("Register global exception handler for custom HTTPException.")
    app.add_exception_handler(HTTPException, http_exception_handler)

    return app
