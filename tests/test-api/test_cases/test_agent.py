import allure


@allure.parent_suite("Agent Management")
class TestAgentManagement:

    @allure.title("Test Agents List")
    @allure.feature("Agents List")
    def test_agents_list(self, autonomous_agent_api):
        response = autonomous_agent_api.agents_list()
        assert response.status_code == 200

    @allure.title("Test Get Admin Agent")
    @allure.feature("Get Admin Agent")
    def test_get_agent(self, autonomous_agent_api, create_admin_agent_fixture):
        response = autonomous_agent_api.get_agent(
            agentID=create_admin_agent_fixture.json().get("id")
        )
        assert response.status_code == 200
        assert response.json().get("id") == create_admin_agent_fixture.json().get("id")

    @allure.title("Test Admin Agent Edit")
    @allure.feature("Admin Agent Edit")
    def test_edit_admin_agent(
        self, create_admin_agent_fixture, edit_admin_agent_fixture
    ):
        assert create_admin_agent_fixture.json().get(
            "id"
        ) == edit_admin_agent_fixture.json().get("id")
        assert create_admin_agent_fixture.json().get(
            "name"
        ) != edit_admin_agent_fixture.json().get("name")

    @allure.title("Test Delete Admin Agent")
    @allure.feature("Delete Admin Agent")
    def test_delete_admin_agent(self, delete_admin_agent_fixture):
        assert delete_admin_agent_fixture.status_code == 204
