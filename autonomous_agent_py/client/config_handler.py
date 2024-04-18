import json
import asyncio
from websockets.exceptions import ConnectionClosed
from schedule import schedule_actions


default_ping_interval = 10
config_receive_interval = 60

# Global dictionary to store configuration data
config_data = {}


async def receive_config(websocket):
    global config_data  # Use the global configuration dictionary

    while True:
        try:
            # Receive a message from the websocket
            response = await websocket.recv()
            response_dict = json.loads(response)
            # Check if the message is a configuration update
            if response_dict.get("message") == "config_updated":
                # Handle the configuration update
                config_data["instance_count"] = response_dict.get("instance_count")
                config_data["configurations"] = response_dict.get("configurations")
                schedule_actions(config_data)
                print("UPDATE:", response_dict["message"])
                print("Updated Config:", config_data)

            elif response_dict.get("message") == "initial":
                # Store the configuration data
                try:
                    response_dict = json.loads(response)
                except json.JSONDecodeError:
                    # Handle failed JSON decoding
                    print("Failed to decode JSON response:", response)
                    continue  # Skip this iteration and wait for the next message
                config_data["instance_count"] = response_dict.get("instance_count")
                config_data["configurations"] = response_dict.get("configurations")
                schedule_actions(config_data)
                print("Received configuration:", config_data)
            else:
                print("Received:", response)

        except ConnectionClosed:
            print("Connection closed by server")
            break


async def print_config_periodically():
    while True:
        await asyncio.sleep(config_receive_interval)  # Wait for 60 seconds
        print("Current configuration data:", config_data)
