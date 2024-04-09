import asyncio
import websockets
import argparse
from websockets.exceptions import ConnectionClosed

default_ping_timeout = 10  # Sends a ping every 10 seconds


async def connect_to_server(agent_id):
    uri = "ws://127.0.0.1:8000/api/agent/ws"
    headers = {"agent_id": agent_id}

    try:
        async with websockets.connect(uri, extra_headers=headers) as websocket:
            while True:
                try:
                    await websocket.send("PING")
                    response = await websocket.recv()
                    print("Received:", response)
                    await asyncio.sleep(default_ping_timeout)
                except ConnectionClosed:
                    print("Connection closed by server")
                    break
    except ConnectionError:
        print("Failed to connect to the server")


async def main(agent_id):
    await connect_to_server(agent_id)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Connect to Central WebSocket server with agent ID"
    )
    parser.add_argument("--agent_id", help="Agent ID to connect with", required=True)
    args = parser.parse_args()

    asyncio.run(main(args.agent_id))
