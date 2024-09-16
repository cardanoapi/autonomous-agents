from pydantic import BaseSettings
import os


class APISettings(BaseSettings):
    APP_ENV: str = "production"
    SECURE: bool = None
    JWT_SECRET_KEY: str = ""
    GOV_ACTION_API: str = "https://govtool.cardanoapi.io/api"
    SAME_SITE = "None"

    def __init__(self, **values):
        super().__init__(**values)
        self.SECURE = True if self.APP_ENV == "production" else False
        self.SAME_SITE = "None" if self.APP_ENV == "production" else "lax"
