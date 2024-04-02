import asyncio
import websockets
import argparse

default_ping_timeout = 10  # Sends a ping every 10 second

async def connect_to_server(agent_id):
    
    uri = "ws://127.0.0.1:8000/api/agent/ws"
    headers = {"agent_id": agent_id}

    async with websockets.connect(uri, extra_headers=headers) as websocket:
        while True:
            await websocket.send("PING")
            response = await websocket.recv()
            print("Received:", response)
            await asyncio.sleep(default_ping_timeout)

async def main(agent_id):
    await connect_to_server(agent_id)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Connect to Central WebSocket server with agent ID")
    parser.add_argument("--agent_id", help="Agent ID to connect with", required=True)
    args = parser.parse_args()

    asyncio.run(main(args.agent_id))
