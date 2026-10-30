from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Arthsetu API"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "secret-key-change-in-production"
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/arthsetu"

    class Config:
        env_file = ".env"

settings = Settings()
