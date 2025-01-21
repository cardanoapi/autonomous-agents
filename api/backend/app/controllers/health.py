"""Application implementation - Ready controller."""

import asyncio
import logging

import aiohttp
import httpx
from fastapi import APIRouter
from backend.config import settings
from backend.app.utils import RedisClient
from backend.app.views import ReadyResponse, ErrorResponse
from backend.app.exceptions import HTTPException
from backend.config.api_settings import api_settings
from backend.config.database import prisma_connection
from backend.dependency import kafka_service
from datetime import datetime

router = APIRouter()
log = logging.getLogger(__name__)


@router.get(
    "/health",
    tags=["health"],
    summary="Simple health check.",
    responses={502: {"model": ErrorResponse}},
)
async def readiness_check():
    """Run basic application health check.

    If the application is up and running then this endpoint will return simple
    response with status ok. Moreover, if it has Redis enabled then connection
    to it will be tested. If Redis ping fails, then this endpoint will return
    502 HTTP error.
    \f

    Returns:
        response (ReadyResponse): ReadyResponse model object instance.

    Raises:
        HTTPException: If applications has enabled Redis and can not connect
            to it. NOTE! This is the custom exception, not to be mistaken with
            FastAPI.HTTPException class.

    """
    log.info("Started GET /health")

    if settings.USE_REDIS and not await RedisClient.ping():
        log.error("Could not connect to Redis")
        raise HTTPException(
            status_code=502,
            content=ErrorResponse(code=502, message="Could not connect to Redis").dict(exclude_none=True),
        )

    is_kafka_healthy = await kafka_health_check()
    is_db_healthy = await database_health_check()
    is_dbsync_healthy = await dbsync_health_check()
    backend_health_stat = {
        "isHealthy": is_db_healthy and is_kafka_healthy and is_dbsync_healthy,
        "details": {
            "kafka": {"is_healthy": is_kafka_healthy},
            "database": {"is_healthy": is_db_healthy},
            "dbsync": {"isHealthy": is_dbsync_healthy},
        },
    }

    if is_db_healthy and is_kafka_healthy and is_dbsync_healthy:
        return backend_health_stat
    else:
        print("failed status: ", backend_health_stat)
        raise HTTPException(status_code=502, content=backend_health_stat)


async def dbsync_health_check():
    async with aiohttp.ClientSession() as session:
        async with session.get(api_settings.DB_SYNC_BASE_URL + "/health") as response:
            if response.status == 200:
                return True
            print("DbSync Error: ", await response.json(), await response.text())
            return False


async def database_health_check():
    dummy_val = await prisma_connection.prisma.execute_raw("SELECT 1 AS dummy_value")
    return dummy_val == 1


async def kafka_health_check():
    prefix = api_settings.getKafkaTopicPrefix()
    try:
        topics = await kafka_service.fetch_topics()
        return (prefix + "-triggers") in topics
    except Exception as e:
        print("KafkaHealthCheckError: ", e)
