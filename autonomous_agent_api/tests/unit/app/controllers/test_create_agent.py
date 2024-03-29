from backend.app.asgi import get_application
from fastapi.testclient import TestClient
from fastapi import status
import pytest


client = TestClient(get_application())


@pytest.mark.create_agent
def test_create_agent():
    agent_data = {"name": "Test Agent", "action": [], "triggers": []}
    response = client.post("/create_agents/", json=agent_data)

    assert response.status_code == status.HTTP_200_OK
    assert "id" in response.json()
    assert response.json()["name"] == "Test Agent"
    assert response.json()["action"] == []
    assert response.json()["triggers"] == []
    assert "created_at" in response.json()
    assert "updated_at" is None
    assert "deleted_at" is None
