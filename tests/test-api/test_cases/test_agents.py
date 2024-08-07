from utils.logger import logger
import pytest
from models.agent.agent_dto import AgentUpdateDTO, AgentCreateDTO
import uuid
import os
import subprocess
import time
from lib.faucet_api import CardanoFaucet


def test_agents_list(autonomous_agent_api):
    response = autonomous_agent_api.agents_list()
    assert response.status_code == 200


def test_edit_admin_agent(create_admin_agent_fixture, edit_admin_agent_fixture):
    assert create_admin_agent_fixture.json().get(
        "id"
    ) == edit_admin_agent_fixture.json().get("id")
    assert create_admin_agent_fixture.json().get(
        "name"
    ) != edit_admin_agent_fixture.json().get("name")


def test_run_agent_logs(run_admin_agent_fixture, autonomous_agent_api):
    agent_id = run_admin_agent_fixture.json().get("id")
    response = autonomous_agent_api.get_trigger_history_by_agent_id(agent_id)
    logs = response.json().get("items")
    assert len(logs) > 0


@pytest.mark.skip
def test_delete_admin_agent(delete_admin_agent_fixture):
    assert delete_admin_agent_fixture.status_code == 204


@pytest.mark.skip
def test_load_funds():
    cardano_faucet = CardanoFaucet.from_env()
    response = cardano_faucet.retrieve_funds(
        address="addr_test1qz0l996a60yxhs663uljwjghcfyvrk0ys25jmu4ehzjnwqpp4ak4rx05tv02wcequkvve06wf5uvsshxfaf7x2q09fvqz4kfck"
    )
    logger.info(response)
    assert response.status_code == 200
