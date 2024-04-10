import asyncio
import websockets
import argparse
from websockets.exceptions import ConnectionClosed

default_ping_interval = 10  # Sends a ping every 10 seconds
config_receive_interval = 60  # Receives config every 60 seconds


async def send_ping(websocket):
    while True:
        try:
            await websocket.send("PING")
            await asyncio.sleep(default_ping_interval)
        except ConnectionClosed:
            print("Connection closed by server")
            break


async def receive_config(websocket):
    while True:
        try:
            # Use wait_for to set a timeout for receiving messages
            response = await asyncio.wait_for(
                websocket.recv(), timeout=config_receive_interval
            )

            # Check if the received message is an update message
            if response == {"message": "config_updated"}:
                print("Received config update message:", response)
                # Handle the config update message here

            # Print other messages received
            else:
                print("Received message:", response)

        except asyncio.TimeoutError:
            # Timeout occurred, continue waiting
            pass

        except ConnectionClosed:
            print("Connection closed by server")
            break


async def connect_to_server(agent_id):
    uri = "ws://127.0.0.1:8000/api/agent/ws"
    headers = {"agent_id": agent_id}

    try:
        async with websockets.connect(uri, extra_headers=headers) as websocket:
            ping_task = asyncio.create_task(send_ping(websocket))
            config_task = asyncio.create_task(receive_config(websocket))
            await asyncio.gather(ping_task, config_task)
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
