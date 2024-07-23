from unittest.mock import MagicMock

import pytest
from fastapi.testclient import TestClient
from backend.app import get_application
from backend.config import settings
from backend.config.database import PrismaConnection
from backend.app.repositories.user_repository import UserRepository
from datetime import datetime, timezone
from backend.app.models.user.user_dto import SignatureDataDto
from backend.app.asgi import get_test_application


@pytest.fixture
def app_runner():
    # Overriding to true in order to initialize redis client on FastAPI event
    # startup handler. It'll be needed for unit tests.
    settings.USE_REDIS = True
    app = get_application()

    with TestClient(app) as client:
        yield client


@pytest.fixture
def test_client():
    with TestClient(get_test_application()) as client:
        yield client


@pytest.fixture
def demo_signed_data():
    demo_signed_data = SignatureDataDto(
        signature="84584aa3012704581de06d31162c8b37ec443bd42c4707a8fc3f0a1d2fa9aeee54bdff7341ba6761646472657373581de06d31162c8b37ec443bd42c4707a8fc3f0a1d2fa9aeee54bdff7341baa166686173686564f45858536967696e696e6720696e746f204175746f6e6f6d6f7573204167656e742054657374696e67206174204d6f6e204a756c20323220323032342031303a33323a333620474d542b3035343520284e6570616c2054696d65295840a145af95a7cb60a02987a919cf972e669cbfa1d7a08059e56d4c159f786bd798807dff4af23db6f4e2107dbb8f88365b5eee676bcefdfcf4db63a2f904471403",
        key="a5010102581de06d31162c8b37ec443bd42c4707a8fc3f0a1d2fa9aeee54bdff7341ba03272006215820bce6019d4f121b928a4ebb5c1826cf6ad9c9cdc001a731c0be09373a43230322",
    )
    return demo_signed_data
