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

demo_signed_data = SignatureDataDto(
    signature="84584aa3012704581de06d31162c8b37ec443bd42c4707a8fc3f0a1d2fa9aeee54bdff7341ba6761646472657373581de06d31162c8b37ec443bd42c4707a8fc3f0a1d2fa9aeee54bdff7341baa166686173686564f45858536967696e696e6720696e746f204175746f6e6f6d6f7573204167656e742054657374696e67206174204d6f6e204a756c20323220323032342031303a33323a333620474d542b3035343520284e6570616c2054696d65295840a145af95a7cb60a02987a919cf972e669cbfa1d7a08059e56d4c159f786bd798807dff4af23db6f4e2107dbb8f88365b5eee676bcefdfcf4db63a2f904471403",
    key="a5010102581de06d31162c8b37ec443bd42c4707a8fc3f0a1d2fa9aeee54bdff7341ba03272006215820bce6019d4f121b928a4ebb5c1826cf6ad9c9cdc001a731c0be09373a43230322",
)


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

    async def test_normal_user_login(self, user_service, auth_router):
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
