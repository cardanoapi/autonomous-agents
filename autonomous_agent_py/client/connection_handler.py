import asyncio
from websockets import connect
from websockets.exceptions import ConnectionClosed

default_ping_interval = 10


async def send_ping(websocket):
    while True:
        try:
            await websocket.send("PING")
            await asyncio.sleep(default_ping_interval)
        except ConnectionClosed:
            print("Connection closed by server")
            break


async def connect_to_server(uri, agent_id, receive_config, print_config_periodically):
    headers = {"agent_id": agent_id}

    try:
        async with connect(uri, extra_headers=headers) as websocket:
            ping_task = asyncio.create_task(send_ping(websocket))
            config_task = asyncio.create_task(receive_config(websocket))
            print_task = asyncio.create_task(print_config_periodically())
            await asyncio.gather(ping_task, config_task, print_task)
    except ConnectionError:
        print("Failed to connect to the server")
