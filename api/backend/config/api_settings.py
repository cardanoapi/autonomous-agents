from pydantic import BaseSettings
import os


class APISettings(BaseSettings):
    ENVIRONMENT: str = os.environ.get("APP_ENV", "production")
    SECURE: bool = True if ENVIRONMENT == "productiongit " else False
    JWT_SECRET_KEY: str = os.environ.get("JWT_SECRET_KEY", "")
