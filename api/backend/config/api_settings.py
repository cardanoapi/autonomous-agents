from pydantic import BaseSettings


class APISettings(BaseSettings):
    APP_ENV: str = "production"
    SECURE: bool = None
    JWT_SECRET_KEY: str = ""
    DB_SYNC_API: str = "https://dbsyncapi.agents.cardanoapi.io/api"
    SAME_SITE = "None"
    METADATA_API: str = "https://metadata.drep.id/api"
    GOV_ACTION_API: str = "https://govtool.cardanoapi.io/api"
    KAFKA_TOPIC_PREFIX: str = ""
    KAFKA_PREFIX: str = ""

    def __init__(self, **values):
        super().__init__(**values)
        self.SECURE = True if self.APP_ENV == "production" else False
        self.SAME_SITE = "None" if self.APP_ENV == "production" else "lax"

    def getKafkaTopicPrefix(self):
        return self.KAFKA_TOPIC_PREFIX if self.KAFKA_TOPIC_PREFIX else self.KAFKA_PREFIX


api_settings = APISettings()
