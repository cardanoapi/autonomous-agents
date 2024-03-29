from backend.app.asgi import get_test_application
from fastapi.testclient import TestClient
from fastapi import status
import pytest

client = TestClient(get_test_application)


@pytest.mark.ping
def test_ping():
    response = client.get("/api/ping")
    assert response.status_code == status.HTTP_200_OK
