from http import HTTPStatus
from typing import Any, Dict
from backend.app.exceptions import HTTPException


class ForbiddenException(HTTPException):
    def __init__(self, content="You are unauthorized to access this content", headers=None):
        super().__init__(status_code=HTTPStatus.FORBIDDEN, content=content, headers=headers)
