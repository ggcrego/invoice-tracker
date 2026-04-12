from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/postgres"
    SUPABASE_URL: str = ""
    SUPABASE_PUBLISHABLE_KEY: str = ""  # sb_publishable_... (replaces anon key)
    SUPABASE_SECRET_KEY: str = ""       # sb_secret_... (replaces service_role key)
    GOOGLE_CLOUD_VISION_API_KEY: str = ""
    ENVIRONMENT: str = "development"

    @property
    def supabase_jwks_url(self) -> str:
        """JWKS endpoint for verifying Supabase JWTs with ES256."""
        return f"{self.SUPABASE_URL}/auth/v1/.well-known/jwks.json"

    class Config:
        env_file = ".env"

settings = Settings()
