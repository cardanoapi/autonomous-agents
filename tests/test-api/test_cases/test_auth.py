# user login and logout
def test_user_login(user_login_response):
    assert user_login_response.status_code == 200
    assert user_login_response.json().get("isSuperUser") == False
    assert user_login_response.headers.get("set-cookie") is not None


def test_logout_user(user_login_cookie, autonomous_agent_api):
    response = autonomous_agent_api.logout_user(headers={"Cookie": user_login_cookie})
    assert response.status_code == 200
    assert 'access_token=""' in response.headers.get("set-cookie")


# admin login and logout
def test_admin_login(admin_login_response):
    assert admin_login_response.status_code == 200
    assert admin_login_response.json().get("isSuperUser") == True
    assert admin_login_response.headers.get("set-cookie") is not None


def test_admin_logout(admin_login_cookie, autonomous_agent_api):
    response = autonomous_agent_api.logout_user(headers={"Cookie": admin_login_cookie})
    assert response.status_code == 200
    assert 'access_token=""' in response.headers.get("set-cookie")
