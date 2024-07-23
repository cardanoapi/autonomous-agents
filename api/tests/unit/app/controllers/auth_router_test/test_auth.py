import pytest
from backend.app.services.user_service import UserService
from backend.app.controllers.auth_router import AuthRouter
import logging
from datetime import datetime, timezone
from unittest.mock import AsyncMock, MagicMock
from backend.app.models.user.user_dto import SignatureDataDto, UserCreateDto
from backend.app.utils.signed_data import extract_signed_address_from_signature_header
from backend.app.models.user.response_dto import UserResponse
import json

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@pytest.mark.asyncio
class TestAuth:

    @pytest.fixture
    def user_service(self):
        user_service = MagicMock(spec=UserService)
        user_service.create_user = AsyncMock(
            side_effect=lambda user_data: UserResponse(
                address=user_data.address, created_at=datetime.now(timezone.utc), isSuperUser=user_data.isSuperUser
            )
        )
        return user_service

    @pytest.fixture
    def auth_router(self, user_service):
        return AuthRouter(user_service)

    async def test_normal_user_login(self, user_service, auth_router, demo_signed_data):
        user_address = extract_signed_address_from_signature_header(demo_signed_data.signature)
        expected_result = UserResponse(address=user_address, created_at=datetime.now(timezone.utc), isSuperUser=False)
        response = await auth_router.login_user(demo_signed_data)
        user_service.create_user.assert_called_once_with(UserCreateDto(address=user_address, isSuperUser=False))
        result = json.loads(response.body.decode("utf-8"))

        assert result["address"] == expected_result.address
        assert result["isSuperUser"] == expected_result.isSuperUser
        assert "set-cookie" in response.headers

    async def test_user_logout(self, auth_router, test_client):
        response = test_client.post("/api/logout", cookies={"access_token": "test"})
        assert "set-cookie" in response.headers
        cookie_header = response.headers["set-cookie"]
        assert 'access_token="";' in cookie_header
        assert response.status_code == 200
