"""Application implementation - ASGI."""

import os
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

from backend.config import settings
from backend.app.router import root_api_router
from backend.config.logger import logger
from backend.app.utils import RedisClient, AiohttpClient
from backend.app.exceptions import HTTPException, http_exception_handler
from backend.config.database import prisma_connection
from backend.dependency import kafka_service
from fastapi_pagination import add_pagination

log = logging.getLogger(__name__)


# updated startup and shutdown event with lifespan event due to deprecation issue
@asynccontextmanager
async def lifespan(app: FastAPI):
    log.debug("Execute FastAPI startup event handler.")
    if settings.USE_REDIS:
        await RedisClient.open_redis_client()

    AiohttpClient.get_aiohttp_client()

    log.info("Starting Server")

    await prisma_connection.connect()

    await kafka_service.start()

    yield
    log.debug("Execute FastAPI shutdown event handler.")

    await kafka_service.stop()

    # Gracefully close utilities.
    if settings.USE_REDIS:
        await RedisClient.close_redis_client()

    await AiohttpClient.close_aiohttp_client()

    await prisma_connection.disconnect()

    log.info("Stopping Server")


# Lifespan used for Test Environmnet : Configurations such as Live Database and Redis is Disabled.
# todo : Mock Database setup required for testing
@asynccontextmanager
async def test_lifespan(app: FastAPI):
    log.debug("Execute FastAPI startup event handler.")

    AiohttpClient.get_aiohttp_client()

    logger.info("Starting Test Server")

    yield

    log.debug("Execute FastAPI shutdown event handler.")

    logger.info("Stopping Test Server")


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
        lifespan=lifespan,
    )

    origins = [
        "http://localhost:8080",
        "http://localhost:3000",
        "http://localhost:3001",
        "https://agents.cardanoapi.io",
        "https://sanchonet.agents.cardanoapi.io",
        "https://preview.agents.cardanoapi.io",
        "https://preprod.agents.cardanoapi.io",
        "https://sancho.agents.cardanoapi.io",
    ]

    log.debug("Add application routes.")
    log.debug("Register global exception handler for custom HTTPException.")
    setup_apm(app)
    add_pagination(app)
    app.include_router(root_api_router)
    app.add_exception_handler(HTTPException, http_exception_handler)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    return app


def get_test_application() -> FastAPI:
    """
    Initialize FastApi application for testing environment

    Returns:
     FastAPI : Application object instance

    """
    os.environ.__setattr__("TESTING", True)

    logging.info("Setting up Test Environment")
    app = FastAPI(
        title=settings.PROJECT_NAME,
        debug=settings.DEBUG,
        version=settings.VERSION,
        docs_url=settings.DOCS_URL,
        lifespan=test_lifespan,
    )
    log.debug("Add test application routes.")
    app.include_router(root_api_router)
    log.debug("Register global exception handler for custom HTTPException.")
    app.add_exception_handler(HTTPException, http_exception_handler)
    return app


def setup_apm(app):
    environment = os.environ.get("ELASTIC_APM_ENVIRONMENT")
    service_name = os.environ.get("ELASTIC_APM_SERVICE_NAME")
    if os.environ.get("ELASTIC_APM_SERVER_URL"):
        from elasticapm.contrib.starlette import make_apm_client, ElasticAPM

        apm = make_apm_client(
            {
                "ENVIRONMENT": environment if environment else "local",
                "SERVICE_NAME": service_name if service_name else "autonomous-agents-backend",
                "CAPTURE_BODY": all,
            }
        )
        app.add_middleware(ElasticAPM, client=apm)
    else:
        logger.info("Elastic APM is disabled")
