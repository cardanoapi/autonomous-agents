import allure


def assert_successful_log(logs, function_name, trigger_type, message):
    """Helper function to assert a successful log entry with specific criteria."""
    assert any(
        log["functionName"] == function_name
        and log["triggerType"] == trigger_type
        and log["status"] == True
        and log["success"] == True
        for log in logs
    ), message


@allure.parent_suite("Agent Function Execution")
class TestAgentFunctionExecution:

    @allure.sub_suite("CRON")
    @allure.title("Test Cron Transfer ADA Logs")
    @allure.feature("Transfer Ada Cron Function")
    def test_cron_transfer_ada_logs(
        self, run_admin_agent_fixture, autonomous_agent_api
    ):
        agent_id = run_admin_agent_fixture.json().get("id")
        logs = (
            autonomous_agent_api.get_trigger_history(
                param=f"?agent_id={agent_id}&functionName={'transferADA'}"
            )
            .json()
            .get("items")
        )
        assert_successful_log(
            logs,
            function_name="transferADA",
            trigger_type="CRON",
            message="No successful 'transferADA' log found",
        )

    @allure.sub_suite("MANUAL")
    @allure.title("Test Manual Info Action Proposal Logs")
    @allure.feature("Create Gov Info Action Function")
    def test_manual_info_action_proposal_logs(
        self, run_admin_agent_fixture, autonomous_agent_api
    ):
        agent_id = run_admin_agent_fixture.json().get("id")
        logs = (
            autonomous_agent_api.get_trigger_history(
                param=f"?agent_id={agent_id}&functionName={'createInfoGovAction'}"
            )
            .json()
            .get("items")
        )
        assert_successful_log(
            logs,
            function_name="createInfoGovAction",
            trigger_type="MANUAL",
            message="No successful 'create infoAction proposal' log found",
        )

    @allure.sub_suite("EVENT")
    @allure.title("Test Event Vote Logs")
    @allure.feature("Vote Event Function")
    def test_event_vote_logs(self, run_admin_agent_fixture, autonomous_agent_api):
        agent_id = run_admin_agent_fixture.json().get("id")
        logs = (
            autonomous_agent_api.get_trigger_history(
                param="?agent_id=" + str(agent_id) + "&functionName=voteOnProposal"
            )
            .json()
            .get("items")
        )
        assert_successful_log(
            logs,
            function_name="voteOnProposal",
            trigger_type="EVENT",
            message="No successful 'voteEvent' log found",
        )
