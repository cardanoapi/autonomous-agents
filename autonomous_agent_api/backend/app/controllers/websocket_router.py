from fastapi import (
    WebSocket,
    APIRouter,
    WebSocketDisconnect,
    WebSocketException,
    status,
)
from datetime import datetime

from backend.app.repositories.websocket_manager_repository import (
    check_if_agent_exists_in_db,
    fetch_agent_configuration,
)
from backend.app.services.websocket_manager_service import manager

router = APIRouter()


@router.websocket("/agent/ws")
async def agent_websocket_endpoint(websocket: WebSocket):
    websocket_agent_id = websocket.headers.get("agent_id")
    if websocket_agent_id is None:
        raise WebSocketException(code=status.WS_1008_POLICY_VIOLATION)

    agent_exists = await check_if_agent_exists_in_db(websocket_agent_id)
    if agent_exists:
        await manager.remove_previous_agent_connection_if_exists(websocket_agent_id)
        await manager.connect_websocket(websocket_agent_id, websocket)

        instance_count, configurations = await fetch_agent_configuration(websocket_agent_id)
        await websocket.send_json(
            {
                "message": "initial",
                "instance_count": instance_count,
                "configurations": configurations,
            }
        )
        try:
            while True:
                data = await websocket.receive_text()
                print(f"Received Data: {data} from {websocket_agent_id}")
                await websocket.send_json(
                    {
                        "message": "Pong received from Server",
                        "timestamp": datetime.now().isoformat(),
                    }
                )
                await manager.update_last_active_timestamp(websocket_agent_id)

        except WebSocketDisconnect:
            await manager.disconnect_websocket(websocket_agent_id)
            pass
    else:
        raise WebSocketException(code=status.WS_1008_POLICY_VIOLATION)
