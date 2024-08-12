from models.agent.agent_dto import AgentCreateDTO, AgentUpdateDTO
import uuid
import pytest
import subprocess
import time
import os
from test_cases.data.agent_function import (
    transfer_ada_cron_function,
    vote_event_function,
)
from lib.faucet_api import CardanoFaucet
from test_cases.data.agent_function import info_action_manual_trigger


@pytest.fixture(scope="session")
def create_admin_agent_fixture(
    admin_login_cookie, autonomous_agent_api, edit_template_fixture
):
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
    agent_response = autonomous_agent_api.get_agent(
        create_admin_agent_fixture.json().get("id")
    )
    cardano_faucet = CardanoFaucet(os.environ.get("CARDANO_FAUCET_API_KEY"))
    for i in range(2):  # loading funds twice.
        response = cardano_faucet.load_funds(agent_response.json().get("agent_address"))
        time.sleep(60)  # wait for funds transfer cooldown.
    return response


@pytest.fixture(scope="session")
def edit_admin_agent_fixture(
    create_admin_agent_fixture, autonomous_agent_api, admin_login_cookie
):
    new_agent_name = str(uuid.uuid4())
    template_id = create_admin_agent_fixture.json().get("template_id")
    # default address for sancho net facuet , if reciever address is not set
    reciever_address = os.environ.get(
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
                reciever_address=reciever_address,
                value=20000,
                probability=1,
            ),
            vote_event_function(agent_id=agent_id),
        ],
    ).model_dump()
    response = autonomous_agent_api.edit_agent(
        body=body,
        headers={"Cookie": admin_login_cookie},
        agentID=create_admin_agent_fixture.json().get("id"),
    )
    return response


@pytest.fixture(scope="session")
def run_admin_agent_fixture(
    edit_admin_agent_fixture,
    load_funds_to_agent_address,
    autonomous_agent_api,
    admin_login_cookie,
):
    """
    This fixture runs admin agent for given seconds using the agent-node. defaults to 180 seconds
    """
    assert load_funds_to_agent_address.status_code == 200

    agent_id = edit_admin_agent_fixture.json().get("id")
    project_path = "../../agent-node"
    env = os.environ.copy()
    env["WS_URL"] = env.get("AGENT_MANAGER_WS_URL")
    env["AGENT_ID"] = agent_id
    try:

        # run agent-node with yarn and env variables
        subprocess.run(["yarn", "install"], cwd=project_path, env=env, check=True)
        process = subprocess.Popen(
            ["yarn", "start"],
            cwd=project_path,
            env=env,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
        )
        time.sleep(10)

        # Execute create gov info action manual trigger
        response = autonomous_agent_api.agent_manual_trigger(
            agentID=agent_id,
            body=info_action_manual_trigger().model_dump(),
            headers={"Cookie": admin_login_cookie},
        )
        assert response.status_code == 200

        # let agent run for some give time then terminate the sub process
        runtime = os.getenv("AGENT_RUN_TIMEOUT", 320)
        runtime = runtime if isinstance(runtime, int) else 180
        time.sleep(runtime)
        process.terminate()

    except Exception as e:
        print("Error while running admin agent:", e)
        return False
    return edit_admin_agent_fixture


@pytest.fixture(scope="session")
def delete_admin_agent_fixture(
    run_admin_agent_fixture, autonomous_agent_api, admin_login_cookie
):
    response = autonomous_agent_api.delete_agent(
        headers={"Cookie": admin_login_cookie},
        agentID=run_admin_agent_fixture.json().get("id"),
    )
    assert response.status_code == 204
    return response
