from pydantic import Field, SecretStr, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")
    app_env: str = "development"
    database_url: str = "sqlite+aiosqlite:///./mergen.db"
    llm_provider: str = "openai"
    llm_api_key: SecretStr = SecretStr("")
    llm_model_project_analysis: str = ""
    llm_model_fast: str = ""
    llm_model_strong: str = ""
    llm_timeout_seconds: float = Field(default=120, gt=0, le=180)
    llm_project_analysis_timeout_seconds: float = Field(default=35, gt=0, le=180)
    llm_max_output_tokens_fast: int = Field(default=2500, ge=128, le=16000)
    llm_max_output_tokens_strong: int = Field(default=7000, ge=128, le=16000)
    llm_retries: int = Field(default=0, ge=0, le=2)
    cors_origins: str = "http://localhost:5173"
    demo_mode: bool = True
    demo_fixtures: bool = False

    @model_validator(mode="after")
    def fixture_mode(self):
        if self.demo_fixtures and (not self.demo_mode or self.app_env == "production"):
            raise ValueError("Demo fixture yalnızca geliştirme/demo modunda kullanılabilir.")
        return self
