from utils.logger import logger
import time
from test_cases.data.agent_function import info_action_manual_trigger
from test_cases.data.agent_function import info_action_manual_trigger
import pytest


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


def assert_successful_log(logs, function_name, trigger_type, message):
    """Helper function to assert a successful log entry with specific criteria."""
    assert any(
        log["functionName"] == function_name
        and log["triggerType"] == trigger_type
        and log["status"] == True
        and log["success"] == True
        for log in logs
    ), message


def test_cron_transfer_ada_logs(run_admin_agent_fixture, autonomous_agent_api):
    agent_id = run_admin_agent_fixture.json().get("id")
    logs = (
        autonomous_agent_api.get_trigger_history_by_agent_id(agent_id)
        .json()
        .get("items")
    )
    assert_successful_log(
        logs,
        function_name="transferADA",
        trigger_type="CRON",
        message="No successful 'transferADA' log found",
    )


def test_manual_info_action_proposal_logs(
    run_admin_agent_fixture, autonomous_agent_api
):
    agent_id = run_admin_agent_fixture.json().get("id")
    logs = (
        autonomous_agent_api.get_trigger_history_by_agent_id(agent_id)
        .json()
        .get("items")
    )
    assert_successful_log(
        logs,
        function_name="createInfoGovAction",
        trigger_type="MANUAL",
        message="No successful 'infoAction' log found",
    )


def test_event_vote_logs(run_admin_agent_fixture, autonomous_agent_api):
    agent_id = run_admin_agent_fixture.json().get("id")
    logs = (
        autonomous_agent_api.get_trigger_history_by_agent_id(agent_id)
        .json()
        .get("items")
    )
    assert_successful_log(
        logs,
        function_name="voteOnProposal",
        trigger_type="EVENT",
        message="No successful 'voteEvent' log found",
    )


def test_delete_admin_agent(delete_admin_agent_fixture):
    assert delete_admin_agent_fixture.status_code == 204
