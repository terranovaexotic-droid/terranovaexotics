from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str
    API_KEY: str
    DISCORD_WEBHOOK_URL: str | None = None

    class Config:
        env_file = ".env"

settings = Settings()