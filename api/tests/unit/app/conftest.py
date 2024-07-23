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
