from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/postgres"
    SUPABASE_URL: str = ""
    SUPABASE_ANON_KEY: str = ""
    SUPABASE_SERVICE_KEY: str = ""
    SUPABASE_JWT_SECRET: str = ""
    GOOGLE_CLOUD_VISION_API_KEY: str = ""
    ENVIRONMENT: str = "development"

    class Config:
        env_file = ".env"

settings = Settings()
