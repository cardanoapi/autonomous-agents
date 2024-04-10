import asyncio
import json

from fastapi import WebSocket, APIRouter, WebSocketDisconnect, WebSocketException
from backend.config.database import prisma_connection
from fastapi import status
from datetime import datetime
from backend.config.logger import logger

router = APIRouter()


class WebSocket_Connection_Manager:
    def __init__(self) -> None:
        self.active_connections: dict[str, WebSocket] = {}

    async def connect_websocket(self, websocket_agent_id: str, websocket: WebSocket):
        # Stores Websocket along with agent id in Key Value Pair :  websocket_agent_id : Key , websocket : value
        await websocket.accept()
        self.active_connections[websocket_agent_id] = websocket

    async def disconnect_websocket(self, websocket_agent_id):
        """Critical : Dont use .close() here as this will close the new connection when dealing with multiple web socket request for the same bot.
        This is due to the nature of try/except code that gets called by the previous connection.
        """
        self.active_connections.pop(websocket_agent_id)

    async def send_message_to_websocket(self, websocket_agent_id: str, message: dict):
        # Checks if agent is active first, then sends the message
        agent_active = await self.check_if_agent_active(websocket_agent_id)
        if agent_active:
            if message.get("message") == "config_updated":
                # Fetch updated configuration
                instance_count, configurations = await fetch_agent_configuration(
                    websocket_agent_id
                )
                updated_message = {
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
        # Checks if agent is present in active connection list.
        return websocket_agent_id in self.active_connections

    async def remove_previous_agent_connection_if_exists(self, websocket_agent_id: str):
        """
        If client requests websocket connection for an already active bot.
        Removes the old connection and establishes a new one.
        """
        if await self.check_if_agent_active(websocket_agent_id):
            existing_websocket = self.active_connections.pop(websocket_agent_id)
            await existing_websocket.close(
                code=1000, reason="establishing a new connection"
            )

    async def update_last_active_timestamp(self, agent_id: str):
        try:
            async with prisma_connection:
                # Update last active timestamp in the agent table
                await prisma_connection.prisma.agent.update(
                    where={
                        "id": agent_id
                    },  # Provide the 'where' clause as a keyword argument
                    data={
                        "last_active": datetime.utcnow()
                    },  # Update 'last_active' field
                )
        except Exception as e:
            logger.error(
                f"Error updating last active timestamp for agent {agent_id}: {e}"
            )


manager = WebSocket_Connection_Manager()


@router.websocket("/agent/ws")
async def agent_websocket_endpoint(websocket: WebSocket):
    # todo: Cookies Authentication

    # Get agent id from the websocket header.
    websocket_agent_id = websocket.headers.get("agent_id")
    if websocket_agent_id == None:
        raise WebSocketException(code=status.WS_1008_POLICY_VIOLATION)

    # Check if agent with the id exists.
    agent_exists = await check_if_agent_exists_in_db(websocket_agent_id)
    if agent_exists:
        await manager.remove_previous_agent_connection_if_exists(websocket_agent_id)
        await manager.connect_websocket(websocket_agent_id, websocket)

        instance_count, configurations = await fetch_agent_configuration(
            websocket_agent_id
        )
        await websocket.send_json(
            {"instance_count": instance_count, "configurations": configurations}
        )
        try:
            while True:
                data = await websocket.receive_text()
                # Check if the received data indicates a configuration update
                print(f"Received Data: {data} from {websocket_agent_id}")
                await websocket.send_text(
                    f"Ping recieved from {websocket_agent_id} at {datetime.now()}"
                )
                await manager.update_last_active_timestamp(websocket_agent_id)

        except WebSocketDisconnect:
            await manager.disconnect_websocket(websocket_agent_id)
            pass
    else:
        raise WebSocketException(code=status.WS_1008_POLICY_VIOLATION)


async def check_if_agent_exists_in_db(agent_id: str):
    # Query agent with the agent id from the database -> returns a boolean
    async with prisma_connection:
        agent_exists = await prisma_connection.prisma.agent.find_first(
            where={"id": agent_id, "deleted_at": None}
        )
    return bool(agent_exists)


async def fetch_agent_configuration(agent_id):
    try:
        async with prisma_connection:
            # Fetch instance count from the agent table
            agent_instance = await prisma_connection.prisma.agent.find_first(
                where={"id": agent_id, "deleted_at": None}
            )

            # Fetch configurations from the trigger table
            agent_configurations = await prisma_connection.prisma.trigger.find_many(
                where={"agent_id": agent_id, "deleted_at": None}
            )

        # Extract instance count
        instance_count = agent_instance.instance if agent_instance else None

        # Extract configuration data from the retrieved triggers
        configurations_data = []
        for config in agent_configurations:
            try:
                configuration = {
                    "id": config.id,
                    "type": config.type,
                    "data": config.data,  # Assuming config.data is a JSON string
                }
            except json.JSONDecodeError:
                print(f"Error decoding JSON for config id {config.id}: {config.data}")
                continue  # Skip this config and proceed to the next one

            configurations_data.append(configuration)

        # Return instance count and configurations
        return instance_count, configurations_data
    except Exception as e:
        # Handle any exceptions, such as database connection errors
        print(f"Error fetching agent configuration: {e}")
        return
