import argparse
import asyncio
from connection_handler import connect_to_server
from config_handler import receive_config, print_config_periodically


async def main(agent_id):
    uri = "ws://127.0.0.1:8000/api/agent/ws"
    await connect_to_server(uri, agent_id, receive_config, print_config_periodically)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Connect to Central WebSocket server with agent ID"
    )
    parser.add_argument("--agent_id", help="Agent ID to connect with", required=True)
    args = parser.parse_args()

    asyncio.run(main(args.agent_id))
