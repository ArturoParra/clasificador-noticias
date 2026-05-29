import os
from fastapi import FastAPI
import aiohttp
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
from contextlib import asynccontextmanager
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from pymongo import UpdateOne
from apscheduler.triggers.cron import CronTrigger
import pytz

load_dotenv()

app = FastAPI()

origins = os.getenv("ALLOWED_ORIGINS", "*").split(",")

client = AsyncIOMotorClient(os.getenv("MONGO_URL"))
db = client[os.getenv("MONGO_DB_NAME")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)

scheduler = AsyncIOScheduler()

@asynccontextmanager
async def lifespan(app: FastAPI):
    tz = pytz.timezone('America/Mexico_City')
    
    scheduler.add_job(
        fetch_and_save_top_news, 
        CronTrigger(hour="6,18", minute=0, timezone=tz)
    )
    
    scheduler.start()
    
    yield  
    
    scheduler.shutdown()

app = FastAPI(lifespan=lifespan)

def serialize_news(news):
    return {
        "id": str(news["_id"]),
        "title": news.get("title", ""),
        "description": news.get("description", ""),
        "url": news.get("url", ""),
        "publishedAt": news.get("publishedAt", ""),
        "source": news.get("source", ""),
        "image": news.get("image", ""),
        "category": news.get("category", ""),
        "classification": news.get("classification", "none"),
        "credibilityScore": news.get("credibilityScore", 0)
    }

async def fetch_and_save_top_news():
    print("Iniciando la búsqueda de las top 10 noticias...")
    
    NEWS_API_URL = "https://api.worldnewsapi.com/top-news"
    params = {
        "api-key": os.getenv("WORLD_NEWS_API_KEY"), 
        "source-country": "mx",
        "language": "es", 
        "max-news-per-cluster": 10
    }

    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(NEWS_API_URL, params=params) as response:
                if response.status == 200:
                    data = await response.json()
                    
                    # World News API devuelve {"top_news": [{"news": [{...}]}]}
                    top_news_clusters = data.get("top_news", [])
                    if not top_news_clusters:
                        print("No se encontraron clusters de noticias.")
                        return

                    # Extraer todas las noticias de los clusters
                    all_articles = []
                    for cluster in top_news_clusters:
                        all_articles.extend(cluster.get("news", []))
                    
                    # Limitar a 10 si lo deseas en total, 
                    # o guardar todas las que traigan los clusters
                    articles = all_articles[:10] 

                    operations = []
                    for article in articles:
                        news_doc = {
                            "title": article.get("title", ""),
                            "description": article.get("text", ""), # World News usa 'text' o 'summary'
                            "url": article.get("url", ""),
                            "publishedAt": article.get("publish_date", ""), # API usa 'publish_date'
                            "source": article.get("source_country", ""), # API no anida source.name normalmente
                            "image": article.get("image", ""), # API usa 'image' directamente
                            "category": "general",
                            "classification": "none",
                            "credibilityScore": 0
                        }
                        
                        operations.append(
                            UpdateOne({"url": news_doc["url"]}, {"$set": news_doc}, upsert=True)
                        )
                        
                    if operations:
                        await db.top_news.bulk_write(operations)
                        print(f"Noticias actualizadas exitosamente: {len(operations)} agregadas/verificadas.")
                else:
                    error_data = await response.text()
                    print(f"Error al obtener noticias: {response.status} - {error_data}")
    except Exception as e:
        print(f"Excepción obteniendo noticias: {e}")


@app.get("/api/data")
async def get_data():
    return {"message": "Hello from FastAPI!"}

@app.get("/api/news")
async def get_news():
    cursor = db.top_news.find({})
    items = await cursor.to_list(None)
    
    return [serialize_news(item) for item in items]

@app.post("/api/test-fetch")
async def test_fetch_news():
    """Endpoint de prueba para disparar manualmente la consulta"""
    await fetch_and_save_top_news()
    return {"message": "Proceso de fetch disparado manualmente. Revisa los logs."}