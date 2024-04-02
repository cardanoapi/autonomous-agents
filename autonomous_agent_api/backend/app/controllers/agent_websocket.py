from fastapi import WebSocket, APIRouter, WebSocketDisconnect , WebSocketException
from backend.config.database import prisma_connection
from fastapi import status
from datetime import datetime

router = APIRouter()

class WebSocket_Connection_Manager:
    def __init__(self) -> None:
        self.active_connections : dict[str , WebSocket] = {}

    async def connect_websocket(self, websocket_agent_id : str , websocket: WebSocket ):
        # Stores Websocket along with agent id in Key Value Pair :  websocket_agent_id : Key , websocket : value
        await websocket.accept()
        self.active_connections[websocket_agent_id] = websocket

    async def disconnect_websocket(self, websocket_agent_id):
        self.active_connections.pop(websocket_agent_id)
    
    async def send_message_to_websocket(self , websocket_agent_id : str , message : dict):
        await self.active_connections[websocket_agent_id].send_json(message)
    
    async def check_if_agent_exists_in_active_connection(self , websocket_agent_id : str):
        # Checks if agent is already active in the connections list, if present remove it.
        if websocket_agent_id in self.active_connections:
            self.active_connections.pop(websocket_agent_id)

        

manager = WebSocket_Connection_Manager()


@router.websocket('/ws')
async def agent_websocket_endpoint(websocket: WebSocket):
    # todo: Cookies Authentication
    
    # Get agent id from the websocket header.
    websocket_agent_id = websocket.headers.get('agent_id')
    print(websocket_agent_id)
    if websocket_agent_id == None:
        raise WebSocketException(code= status.WS_1008_POLICY_VIOLATION)

    
    # Check if agent with the id exists.
    agent_exists = await check_if_agent_exists(websocket_agent_id)
    if agent_exists:
        await manager.check_if_agent_exists_in_active_connection(websocket_agent_id)
        await manager.connect_websocket(websocket_agent_id , websocket)
        try:
            while True:
                data = await websocket.receive_text()
                print(f"Received Data: {data}")
                await websocket.send_text(f"Ping recieved from {websocket_agent_id} at {datetime.now()}")
        except WebSocketDisconnect:
            await manager.disconnect_websocket(websocket_agent_id)
    else:
       raise WebSocketException(code= status.WS_1008_POLICY_VIOLATION)


async def check_if_agent_exists(agent_id: str):
    
    # Query agent with the agent id -> reurns a boolean
    async with prisma_connection:
        agent_exists = await prisma_connection.prisma.agent.find_first(where={"id": agent_id, "deleted_at": None})
    return bool(agent_exists)
