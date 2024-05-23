from backend.config import settings
from backend.app.router import root_api_router
from backend.app.asgi import get_application, lifespan
from backend.app.exceptions import (
    HTTPException,
    http_exception_handler,
)


class TestGetApplication:
    def test_should_create_app_and_populate_defaults(self):
        # given / when
        app = get_application()

        # then
        assert app.title == settings.PROJECT_NAME
        assert app.debug == settings.DEBUG
        assert app.version == settings.VERSION
        assert app.docs_url == settings.DOCS_URL
        assert app.lifespan == lifespan
        assert all(r in app.routes for r in root_api_router.routes)
        assert app.exception_handlers[HTTPException] == http_exception_handler
