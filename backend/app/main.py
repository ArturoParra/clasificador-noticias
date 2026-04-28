import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId

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

@app.get("/api/data")
async def get_data():
    return {"message": "Hello from FastAPI!"}

@app.get("/api/news")
async def get_news():
    cursor = db.top_news.find({})
    items = await cursor.to_list(None)
    
    return [serialize_news(item) for item in items]