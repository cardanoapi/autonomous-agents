import pytest
import uuid
from models.template.template_dto import TemplateCreateDto, TemplateEditDto
from test_cases.data.agent_function import (
    generate_demo_transfer_ada_trigger_response_fromat,
)


@pytest.fixture(scope="session")
def create_template_fixture(autonomous_agent_api, admin_login_cookie):
    """Fixture to create a new template."""
    template_name = str(uuid.uuid4())
    template_description = "Template Generated using Integration Test"
    template_triggers = []  # Define any necessary triggers here

    # Create template data
    template_data = TemplateCreateDto(
        name=template_name,
        description=template_description,
        template_triggers=template_triggers,
    ).model_dump()

    # Create template via API
    response = autonomous_agent_api.create_template(
        headers={"Cookie": admin_login_cookie}, body=template_data
    )

    # Validate response
    assert response.status_code == 200
    assert response.json().get("name") == template_name
    assert response.json().get("description") == template_description

    return response


@pytest.fixture(scope="session")
def edit_template_fixture(
    autonomous_agent_api, create_template_fixture, admin_login_cookie
):
    """Fixture to edit an existing template."""
    template = create_template_fixture.json()
    new_template_name = str(uuid.uuid4())
    new_template_description = "Template Edited using Integration Test"

    # Create updated template data
    template_edit_data = TemplateEditDto(
        name=new_template_name,
        description=new_template_description,
        template_configurations=[
            generate_demo_transfer_ada_trigger_response_fromat(
                template_id=template.get("id")
            )
        ],
    ).model_dump()

    # Edit template via API
    response = autonomous_agent_api.edit_template(
        template_id=template.get("id"),
        body=template_edit_data,
        headers={"Cookie": admin_login_cookie},
    )

    # Log and validate response
    print("Logging response from template edit fixture.")
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

    # Delete template via API
    response = autonomous_agent_api.delete_template(
        template_id=edit_template_fixture.json().get("id"),
        headers={"Cookie": admin_login_cookie},
    )
    """Fixture to delete a template after editing."""
    assert delete_admin_agent_fixture.status_code == 204

    # Validate response
    assert response.status_code == 204

    return response
