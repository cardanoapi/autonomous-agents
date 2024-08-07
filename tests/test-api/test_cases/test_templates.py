from models.template.template_dto import TemplateCreateDto, TemplateEditDto
import uuid
import pytest


def test_templates_list(autonomous_agent_api):
    response = autonomous_agent_api.templates_list()
    assert response.status_code == 200


def test_template_edit(edit_template_fixture, create_template_fixture):
    assert edit_template_fixture.status_code == 200
    assert edit_template_fixture.json().get("id") == create_template_fixture.json().get(
        "id"
    )


@pytest.mark.skip
def test_template_delete(delete_template_fixture):
    assert delete_template_fixture.status_code == 204
