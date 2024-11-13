import os
import uuid
import time
import pytest
import subprocess
from models.agent.agent_dto import AgentCreateDTO, AgentUpdateDTO
from lib.faucet_api import CardanoFaucet
from test_cases.data.agent_function import (
    transfer_ada_cron_function,
    vote_event_function,
    info_action_manual_trigger,
)
import base64
from utils.logger import logger


@pytest.fixture(scope="session")
def create_admin_agent_fixture(
    admin_login_cookie, autonomous_agent_api, edit_template_fixture
):
    """Fixture to create an admin agent."""
    new_agent_name = str(uuid.uuid4())
    template_id = edit_template_fixture.json().get("id")
    body = AgentCreateDTO(
        name=new_agent_name, template_id=template_id, instance=1
    ).model_dump()
    response = autonomous_agent_api.create_agent(
        headers={"Cookie": admin_login_cookie}, body=body
    )
    assert response.status_code == 201
    return response


@pytest.fixture(scope="session")
def load_funds_to_agent_address(create_admin_agent_fixture, autonomous_agent_api):
    """Fixture to load funds into the agent's address."""
    agent_response = autonomous_agent_api.get_agent(
        create_admin_agent_fixture.json().get("id")
    )
    cardano_faucet = CardanoFaucet(os.environ.get("CARDANO_FAUCET_API_KEY"))

    for _ in range(2):  # Load funds twice.
        response = cardano_faucet.load_funds(agent_response.json().get("agent_address"))
        time.sleep(60)  # Wait for funds transfer cooldown.

    return response


@pytest.fixture(scope="session")
def admin_agent_fixture(
    autonomous_agent_api, admin_login_cookie, create_admin_agent_fixture
):
    response = autonomous_agent_api.get_agent(
        create_admin_agent_fixture.json().get("id"),
        headers={"Cookie": admin_login_cookie},
    )
    return response


@pytest.fixture(scope="session")
def edit_admin_agent_fixture(
    create_admin_agent_fixture, autonomous_agent_api, admin_login_cookie
):
    """Fixture to edit the created admin agent."""
    new_agent_name = str(uuid.uuid4())
    template_id = create_admin_agent_fixture.json().get("template_id")
    receiver_address = os.environ.get(
        "TRANSFER_ADA_RECIEVER_ADDRESS",
        "addr_test1vz0ua2vyk7r4vufmpqh5v44awg8xff26hxlwyrt3uc67maqtql3kl",
    )
    agent_id = create_admin_agent_fixture.json().get("id")

    body = AgentUpdateDTO(
        name=new_agent_name,
        template_id=template_id,
        agent_configurations=[
            transfer_ada_cron_function(
                agent_id=agent_id,
                reciever_address=receiver_address,
                value=20000,
                probability=1,
            ),
            vote_event_function(agent_id=agent_id),
        ],
        instance=1,
    ).model_dump()

    print(body)

    response = autonomous_agent_api.edit_agent(
        body=body,
        headers={"Cookie": admin_login_cookie},
        agentID=agent_id,
    )

    return response


@pytest.fixture(scope="session")
def run_admin_agent_fixture(
    admin_agent_fixture,
    edit_admin_agent_fixture,
    load_funds_to_agent_address,
    autonomous_agent_api,
    admin_login_cookie,
):
    """
    Fixture to run the admin agent for a specified duration using the agent-node.
    """
    assert load_funds_to_agent_address.status_code == 200

    agent_id = edit_admin_agent_fixture.json().get("id")
    project_path = "../../agent-node"
    agent_secret_key = admin_agent_fixture.json().get("secret_key")
    env = os.environ.copy()
    env["WS_URL"] = env.get("AGENT_MANAGER_WS_URL")
    env["AGENT_ID"] = agent_id
    env["TOKEN"] = convert_to_base64_with_network_prefix(
        agent_secret_key, env.get("NETWORK")
    )

    logger.info(f"token: {env['TOKEN']}")

    try:
        # Run agent-node with yarn and environment variables
        subprocess.run(["yarn", "install"], cwd=project_path, env=env, check=True)
        time.sleep(10)
        process = subprocess.Popen(
            ["yarn", "start"],
            cwd=project_path,
            env=env,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
        )
        time.sleep(20)  # Wait for the agent to start

        # Execute Stake registration , needed to trigger gov action
        response = autonomous_agent_api.agent_manual_trigger(
            agentID=agent_id,
            body={"function_name": "registerStake", "parameters": []},
            headers={"Cookie": admin_login_cookie},
        )

        time.sleep(45)

        # Execute create gov info action manual trigger
        response = autonomous_agent_api.agent_manual_trigger(
            agentID=agent_id,
            body=info_action_manual_trigger().model_dump(),
            headers={"Cookie": admin_login_cookie},
        )
        assert response.status_code == 200

        # Let agent run for a given time then terminate the subprocess
        runtime = int(
            os.getenv("AGENT_RUN_TIMEOUT", 320)
        )  # Default to 320 seconds if not set
        time.sleep(runtime)
        process.terminate()

    except Exception as e:
        print("Error while running admin agent:", e)

    return edit_admin_agent_fixture


@pytest.fixture(scope="session")
def delete_admin_agent_fixture(
    run_admin_agent_fixture, autonomous_agent_api, admin_login_cookie
):
    """Fixture to delete the admin agent after running tests."""
    response = autonomous_agent_api.delete_agent(
        headers={"Cookie": admin_login_cookie},
        agentID=run_admin_agent_fixture.json().get("id"),
    )
    assert response.status_code == 204
    return response


def convert_to_base64_with_network_prefix(agent_secret_key: str, network: str) -> str:
    new_secret_key = f"{network}_{agent_secret_key}"
    encoded_bytes = base64.b64encode(new_secret_key.encode("utf-8"))
    return encoded_bytes.decode("utf-8")
