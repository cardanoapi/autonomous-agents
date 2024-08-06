from utils.logger import logger
import pytest
from models.agent.agent_dto import AgentUpdateDTO, AgentCreateDTO
import uuid
import os
import subprocess
import time


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


def test_delete_admin_agent(delete_admin_agent_fixture):
    assert delete_admin_agent_fixture.status_code == 204
