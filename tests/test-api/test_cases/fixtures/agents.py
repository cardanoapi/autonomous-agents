from models.agent.agent_dto import AgentCreateDTO, AgentUpdateDTO
import uuid
import pytest
import subprocess
import time
import os
from test_cases.data.agent_function import generate_demo_transfer_ada_trigger_format


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
def edit_admin_agent_fixture(
    create_admin_agent_fixture, autonomous_agent_api, admin_login_cookie
):
    new_agent_name = str(uuid.uuid4())
    template_id = create_admin_agent_fixture.json().get("template_id")
    body = AgentUpdateDTO(
        name=new_agent_name,
        template_id=template_id,
        agent_configurations=[
            generate_demo_transfer_ada_trigger_format(
                create_admin_agent_fixture.json().get("id")
            )
        ],
    ).model_dump()
    response = autonomous_agent_api.edit_agent(
        body=body,
        headers={"Cookie": admin_login_cookie},
        agentID=create_admin_agent_fixture.json().get("id"),
    )
    return response


@pytest.fixture(scope="session")
def run_admin_agent_fixture(edit_admin_agent_fixture):
    """
    This fixture runs admin agent for given seconds using the agent-node. defaults to 180 seconds
    """
    agent_id = edit_admin_agent_fixture.json().get("id")
    project_path = "../../agent-node"
    env = os.environ.copy()
    env["WS_URL"] = env.get("AGENT_MANAGER_WS_URL")
    env["AGENT_ID"] = agent_id
    try:
        subprocess.run(["yarn", "install"], cwd=project_path, env=env, check=True)
        process = subprocess.Popen(
            ["yarn", "start"],
            cwd=project_path,
            env=env,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
        )
        runtime = os.getenv("AGENT_RUN_TIMEOUT", 180)
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
