from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    """Application settings"""
    
    # API Settings
    api_title: str = "ATSA Playground API"
    api_version: str = "1.0.0"
    debug: bool = True
    
    # CORS Settings
    backend_cors_origins: list = ["http://localhost:3000", "http://127.0.0.1:3000"]
    
    # Data Settings
    max_upload_size: int = 10 * 1024 * 1024  # 10MB
    allowed_file_types: list = [".csv", ".xlsx", ".xls"]
    
    # Model Settings
    max_forecast_periods: int = 365
    default_confidence_interval: float = 0.95
    
    # Database Settings (if using database)
    database_url: Optional[str] = None
    
    class Config:
        env_file = ".env"