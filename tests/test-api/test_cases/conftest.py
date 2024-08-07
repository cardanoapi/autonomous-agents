import os
from utils.logger import logger
import sys
from lib.autonomous_agent_api import AutonomousAgentApi
import pytest

from test_cases.fixtures.auth import *
from test_cases.fixtures.templates import *
from test_cases.fixtures.agents import *


@pytest.fixture(scope="session")
def autonomous_agent_api():
    base_url = os.environ.get("BASE_API_URL")
    print(os.environ)
    print(base_url)

    if base_url is not None:
        base_url = base_url[:-1] if base_url.endswith("/") else base_url
        logger.info(f"BASE URL : {base_url}")
    else:
        logger.error("BASE_URL is not set")
        sys.exit(1)

    api = AutonomousAgentApi(base_url)
    yield api
