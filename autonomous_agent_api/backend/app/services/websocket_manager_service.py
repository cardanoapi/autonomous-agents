from datetime import datetime
from fastapi import WebSocket
from backend.app.repositories.websocket_manager_repository import (
    fetch_agent_configuration,
)
from backend.config.logger import logger
from backend.config.database import prisma_connection


class WebSocket_Connection_Manager:
    def __init__(self) -> None:
        self.active_connections: dict[str, WebSocket] = {}

    async def connect_websocket(self, websocket_agent_id: str, websocket: WebSocket):
        # Stores Websocket along with agent id in Key Value Pair :  websocket_agent_id : Key , websocket : value
        await websocket.accept()
        self.active_connections[websocket_agent_id] = websocket

    async def disconnect_websocket(self, websocket_agent_id):
        # Disconnecting the connection of agent by removing it from active_connection
        self.active_connections.pop(websocket_agent_id)

    async def send_message_to_websocket(self, websocket_agent_id: str, message: dict):
        # check if agent is active
        agent_active = await self.check_if_agent_active(websocket_agent_id)
        if agent_active:
            if message.get("message") == "config_updated":
                # Fetch updated configuration
                instance_count, configurations = await fetch_agent_configuration(
                    websocket_agent_id
                )
                updated_message = {
                    "message": "config_updated",
                    "instance_count": instance_count,
                    "configurations": configurations,
                }
                await self.active_connections[websocket_agent_id].send_json(
                    updated_message
                )
            else:
                await self.active_connections[websocket_agent_id].send_json(message)
        else:
            logger.critical(
                f"Agent with the id {websocket_agent_id} does not exist in the active Connection list. Sending Message Failed!"
            )

    async def check_if_agent_active(self, websocket_agent_id: str):
        return websocket_agent_id in self.active_connections

    async def remove_previous_agent_connection_if_exists(self, websocket_agent_id: str):
        if await self.check_if_agent_active(websocket_agent_id):
            existing_websocket = self.active_connections.pop(websocket_agent_id)
            await existing_websocket.close(
                code=1000, reason="establishing a new connection"
            )

    async def update_last_active_timestamp(self, agent_id: str):
        try:
            async with prisma_connection:
                await prisma_connection.prisma.agent.update(
                    where={"id": agent_id}, data={"last_active": datetime.utcnow()}
                )
        except Exception as e:
            logger.error(
                f"Error updating last active timestamp for agent {agent_id}: {e}"
            )


manager = WebSocket_Connection_Manager()
