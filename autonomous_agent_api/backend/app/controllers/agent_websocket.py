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
        This is due to the nature of try/except code that gets called by the previous connection."""
        self.active_connections.pop(websocket_agent_id)

    async def send_message_to_websocket(self, websocket_agent_id: str, message: dict):
        # Checks if agent is active , first then sends message
        agent_active = await self.check_if_agent_active(websocket_agent_id)
        if agent_active:
            await self.active_connections[websocket_agent_id].send_json(message)
        else:
            logger.critical(
                "Agent with the id {websocket_agent_id} does not exist in the active Connection list. Sending Message Failed!"
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
            await existing_websocket.close(code=1000, reason="establishing a new connection")


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
        try:
            while True:
                data = await websocket.receive_text()
                print(f"Received Data: {data} from {websocket_agent_id}")
                await websocket.send_text(f"Ping recieved from {websocket_agent_id} at {datetime.now()}")
        except WebSocketDisconnect:
            await manager.disconnect_websocket(websocket_agent_id)
            pass
    else:
        raise WebSocketException(code=status.WS_1008_POLICY_VIOLATION)


async def check_if_agent_exists_in_db(agent_id: str):
    # Query agent with the agent id from the database -> reurns a boolean
    async with prisma_connection:
        agent_exists = await prisma_connection.prisma.agent.find_first(where={"id": agent_id, "deleted_at": None})
    return bool(agent_exists)
