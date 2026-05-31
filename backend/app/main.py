import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
from fastapi import HTTPException
#import de la nueva funcion del modulo de IA para la arquitectura con agentes
from app.ai.graph import execute_analysis

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

@app.post("/api/news/{news_id}/analyze")
async def analyze_news_endpoint(news_id: str):
    """
    Se toma una noticia de la DB por su ID para procesarla con LangGraph + CrewAI 
    y actualizar su clasificacion
    """
    if not ObjectId.is_valid(news_id):
        raise HTTPException(status_code=400, detail="ID de noticia inválido")

    # busqueda de la noticia en la DB
    documento = await db.top_news.find_one({"_id": ObjectId(news_id)})
    if not documento:
        raise HTTPException(status_code=404, detail="Noticia no encontrada")

    # construccion del texto
    texto_a_analizar = f"{documento.get('title', '')}. {documento.get('description', '')}"

    try:
        # Ejecucion de la arquitectura de agentes (LangGraph + CrewAI)
        # idealmente esta función debería ser asíncrona o correr en un hilo separado
        # resultado_ia = await execute_analysis(texto_a_analizar)

        # MOCKUP!!! Simulación temporal de lo que debe devolver la IA
        resultado_ia = {
            "verdict": "Engañosa", 
            "score": 45  # 0 a 100
        }

        await db.top_news.update_one(
            {"_id": ObjectId(news_id)},
            {"$set": {
                "classification": resultado_ia["verdict"].lower(),
                "credibilityScore": resultado_ia["score"]
            }}
        )

        return {
            "message": "Análisis completado",
            "news_id": news_id,
            "classification": resultado_ia["verdict"].lower(),
            "score": resultado_ia["score"]
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error en análisis con el módulo de IA: {str(e)}")