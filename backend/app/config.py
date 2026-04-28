import os
from dotenv import load_dotenv

# Carga las variables del archivo .env
load_dotenv()

class Settings:
    API_KEY: str = os.getenv("WORLD_NEWS_API_KEY")
    BASE_URL: str = os.getenv("BASE_URL")
    NEWS_SOURCE_COUNTRY: str = os.getenv("NEWS_SOURCE_COUNTRY", "mx")
    NEWS_LANGUAGE: str = os.getenv("NEWS_LANGUAGE", "es")
    NEWS_FETCH_LIMIT: int = int(os.getenv("NEWS_FETCH_LIMIT", "10"))
    NEWS_FETCH_INTERVAL_MINUTES: int = int(os.getenv("NEWS_FETCH_INTERVAL_MINUTES", "1"))

    @classmethod
    def validate(cls):
        if not cls.API_KEY:
            raise ValueError("¡Error! No se encontró WORLD_NEWS_API_KEY en el archivo .env")
        if not cls.BASE_URL:
            raise ValueError("¡Error! No se encontró BASE_URL en el archivo .env")
        if cls.NEWS_FETCH_LIMIT <= 0:
            raise ValueError("¡Error! NEWS_FETCH_LIMIT debe ser mayor que 0")
        if cls.NEWS_FETCH_INTERVAL_MINUTES <= 0:
            raise ValueError("¡Error! NEWS_FETCH_INTERVAL_MINUTES debe ser mayor que 0")

settings = Settings()
settings.validate()