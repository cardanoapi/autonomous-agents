import asyncio
import json

import websockets
import argparse
from websockets.exceptions import ConnectionClosed

default_ping_interval = 10  # Sends a ping every 10 seconds
config_receive_interval = 60  # Receives config every 60 seconds

# Global dictionary to store configuration data
config_data = {}


async def send_ping(websocket):
    while True:
        try:
            await websocket.send("PING")
            await asyncio.sleep(default_ping_interval)
        except ConnectionClosed:
            print("Connection closed by server")
            break


async def receive_config(websocket):
    global config_data  # Use the global configuration dictionary
    while True:
        try:
            # Receive a message from the websocket
            response = await websocket.recv()

            # Check if the received message contains the expected JSON format
            if '"instance_count"' in response and '"configurations"' in response:
                config_data = response
                print("Received  configuration:", config_data)
            else:
                print("Received:", response)

        except ConnectionClosed:
            print("Connection closed by server")
            break


async def print_config_periodically():
    while True:
        await asyncio.sleep(config_receive_interval)  # Wait for 60 seconds
        print("Current configuration data:", config_data)


async def connect_to_server(agent_id):
    uri = "ws://127.0.0.1:8000/api/agent/ws"
    headers = {"agent_id": agent_id}

    try:
        async with websockets.connect(uri, extra_headers=headers) as websocket:
            ping_task = asyncio.create_task(send_ping(websocket))
            config_task = asyncio.create_task(receive_config(websocket))
            print_task = asyncio.create_task(print_config_periodically())
            await asyncio.gather(ping_task, config_task, print_task)
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
