import allure
from models.template.template_dto import TemplateCreateDto, TemplateEditDto


@allure.suite("Template Management")
class TestTemplateManagement:

    @allure.title("Test Template Create")
    def test_template_create(self, create_template_fixture):
        assert create_template_fixture.status_code == 200

    @allure.title("Get Template")
    def test_get_template(self, create_template_fixture, autonomous_agent_api):
        response = autonomous_agent_api.get_template(
            template_id=create_template_fixture.json().get("id")
        )
        assert response.status_code == 200
        assert response.json().get("id") == create_template_fixture.json().get("id")

    @allure.title("Test Templates List")
    def test_templates_list(self, autonomous_agent_api):
        response = autonomous_agent_api.templates_list()
        assert response.status_code == 200

    @allure.title("Test Template Edit")
    def test_template_edit(self, edit_template_fixture, create_template_fixture):
        assert edit_template_fixture.status_code == 200
        assert edit_template_fixture.json().get(
            "id"
        ) == create_template_fixture.json().get("id")

    @allure.title("Test Template Delete")
    def test_template_delete(self, delete_template_fixture):
        assert delete_template_fixture.status_code == 204
