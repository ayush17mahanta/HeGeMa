import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "HEGEMA — Heatmap Geo Mapping AI"
    VERSION: str = "1.0.0-hackathon"
    API_V1_STR: str = "/api/v1"
    HEGEMA_ENV: str = os.getenv("HEGEMA_ENV", "development")
    
    SECRET_KEY: str = os.getenv("SECRET_KEY", "tactical-secret-key-32bits-long")
    MQTT_HOST: str = os.getenv("MQTT_HOST", "localhost")
    MQTT_PORT: int = int(os.getenv("MQTT_PORT", 1883))

    class Config:
        case_sensitive = True

settings = Settings()
