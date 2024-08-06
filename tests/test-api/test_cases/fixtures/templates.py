import pytest
import uuid
from models.template.template_dto import TemplateCreateDto, TemplateEditDto


@pytest.fixture(scope="session")
@pytest.mark.order(1)
def create_template_fixture(autonomous_agent_api, admin_login_cookie):
    template_name = str(uuid.uuid4())
    template_description = "Template Generated using Integration Test"
    template_triggers = []
    test_template_data = TemplateCreateDto(
        name=template_name,
        description=template_description,
        template_triggers=template_triggers,
    ).model_dump()

    response = autonomous_agent_api.create_template(
        headers={"Cookie": admin_login_cookie}, body=test_template_data
    )
    assert response.json().get("name") == template_name
    assert response.json().get("description") == template_description
    return response


@pytest.fixture(scope="session")
def edit_template_fixture(
    autonomous_agent_api, create_template_fixture, admin_login_cookie
):
    template = create_template_fixture.json()
    new_template_name = str(uuid.uuid4())

    new_template_description = "Template Edited using Integration Test"
    template_edit_data = TemplateEditDto(
        name=new_template_name,
        description=new_template_description,
        template_configurations=[],
    ).model_dump()

    response = autonomous_agent_api.edit_template(
        template_id=template.get("id"),
        body=template_edit_data,
        headers={"Cookie": admin_login_cookie},
    )

    print("Logging response frm template edit fixture.")
    print(response.json())

    assert response.status_code == 200
    assert response.json().get("name") == new_template_name
    assert response.json().get("description") == new_template_description

    return response


@pytest.fixture(scope="session")
def delete_template_fixture(
    autonomous_agent_api,
    delete_admin_agent_fixture,
    edit_template_fixture,
    admin_login_cookie,
):
    assert delete_admin_agent_fixture.status_code == 204
    response = autonomous_agent_api.delete_template(
        template_id=edit_template_fixture.json().get("id"),
        headers={"Cookie": admin_login_cookie},
    )
    assert response.status_code == 204
    return response
