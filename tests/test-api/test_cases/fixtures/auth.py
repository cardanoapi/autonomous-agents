from test_cases.data.cardano import admin_signed_data, user_signed_data
import pytest


# For Normal User
@pytest.fixture(scope="session")
def user_login_response(autonomous_agent_api):
    return autonomous_agent_api.login_user(body=user_signed_data.model_dump())


@pytest.fixture(scope="session")
def user_login_cookie(user_login_response):
    return user_login_response.headers.get("set-cookie")


@pytest.fixture(scope="session")
def user_address(user_login_response):
    return user_login_response.json()["address"]


# For Admin
@pytest.fixture(scope="session")
def admin_login_response(autonomous_agent_api):
    return autonomous_agent_api.login_user(body=admin_signed_data.model_dump())


@pytest.fixture(scope="session")
def admin_login_cookie(admin_login_response):
    return admin_login_response.headers.get("set-cookie")


@pytest.fixture(scope="session")
def admin_address(admin_login_response):
    return admin_login_response.json()["address"]
