import allure


@allure.suite("User Authentication")
class TestUserAuthentication:

    @allure.title("Test User Login")
    def test_user_login(self, user_login_response):
        assert user_login_response.status_code == 200
        assert user_login_response.json().get("isSuperUser") == False
        assert user_login_response.headers.get("set-cookie") is not None

    @allure.title("Test User Logout")
    def test_logout_user(self, user_login_cookie, autonomous_agent_api):
        response = autonomous_agent_api.logout_user(
            headers={"Cookie": user_login_cookie}
        )
        assert response.status_code == 200
        assert 'access_token=""' in response.headers.get("set-cookie")


@allure.suite("Admin Authentication")
class TestAdminAuthentication:

    @allure.title("Test Admin Login")
    def test_admin_login(self, admin_login_response):
        assert admin_login_response.status_code == 200
        assert admin_login_response.json().get("isSuperUser") == True
        assert admin_login_response.headers.get("set-cookie") is not None

    @allure.title("Test Admin Logout")
    def test_admin_logout(self, admin_login_cookie, autonomous_agent_api):
        response = autonomous_agent_api.logout_user(
            headers={"Cookie": admin_login_cookie}
        )
        assert response.status_code == 200
        assert 'access_token=""' in response.headers.get("set-cookie")
