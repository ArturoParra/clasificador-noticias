import os
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import aiohttp
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
from fastapi import HTTPException
from app.ai.graph import execute_analysis #import de la nueva funcion del modulo de IA para la arquitectura con agentes
from contextlib import asynccontextmanager
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from pymongo import UpdateOne
from apscheduler.triggers.cron import CronTrigger
import pytz
import joblib
import numpy as np

load_dotenv()

scheduler = AsyncIOScheduler()

# Variables globales para persistir el modelo en memoria
modelo = None
umbral_precision_alta = 0.5
MODO_PREDICCION = "balanceado"

@asynccontextmanager
async def lifespan(app: FastAPI):
    global modelo, umbral_precision_alta, MODO_PREDICCION
    tz = pytz.timezone('America/Mexico_City')
    
    scheduler.add_job(
        fetch_and_save_top_news, 
        CronTrigger(hour="6,18", minute=0, timezone=tz)
    )
    
    scheduler.start()
    
    # Intentar cargar mi clasificador de noticias de alta precisión si existe
    archivo_modelo = "clasificador_noticias_alta_precision.pkl"
    if not os.path.exists(archivo_modelo):
        print(f"Advertencia: No se encontró el modelo {archivo_modelo}, usando modelo.pkl original.")
        # Cargar modelo viejo
        try:
            modelo = joblib.load("modelo.pkl")
        except FileNotFoundError:
            print("No se encontró el archivo modelo.pkl.")
    else:
        # Cargar el modelo guardado al arrancar la app
        artefacto_cargado = joblib.load(archivo_modelo)
        
        if isinstance(artefacto_cargado, dict) and "modelo" in artefacto_cargado:
            modelo = artefacto_cargado["modelo"]
            umbral_precision_alta = artefacto_cargado.get("umbral_precision_alta", 0.5)
            MODO_PREDICCION = artefacto_cargado.get("modo_default", "balanceado")
        else:
            modelo = artefacto_cargado
            umbral_precision_alta = 0.5
            MODO_PREDICCION = "balanceado"
            
        print("Modelo de alta precisión cargado exitosamente en memoria.")
    
    yield  
    
    scheduler.shutdown()
    print("Apagando API y liberando recursos...")


app = FastAPI(title="Clasificador de Noticias API", lifespan=lifespan)

origins = os.getenv("ALLOWED_ORIGINS", "*").split(",")

client = AsyncIOMotorClient(os.getenv("MONGO_URL"))
db = client[os.getenv("MONGO_DB_NAME")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)

# Ya no necesitamos el try/except de global, ahora está en el lifespan


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
                        
                    # Llamar a la función de clasificación después de guardar las noticias nuevas
                    await classify_unclassified_news()
                else:
                    error_data = await response.text()

                    print(f"Error al obtener noticias: {response.status} - {error_data}")
    except Exception as e:
        print(f"Excepción obteniendo noticias: {e}")

async def classify_unclassified_news():
    print("Iniciando clasificación de noticias sin procesar...")
    
    # 1. Obtener las noticias que no han sido clasificadas
    cursor = db.top_news.find({"classification": "none"})
    unclassified_news = await cursor.to_list(length=None)
    
    if not unclassified_news:
        print("No hay noticias pendientes por clasificar.")
        return

    operations = []
    
    # Extraer el modelo real si 'modelo' es un diccionario (e.g. guardado como {"modelo": clf})
    real_model = modelo
    vectorizer = None
    if isinstance(modelo, dict):
        # Buscar el modelo principal identificando el que tiene el método 'predict'
        for key, val in modelo.items():
            if hasattr(val, "predict"):
                real_model = val
            elif hasattr(val, "transform") and not hasattr(val, "predict"):
                # Si hay un objeto que solo tiene transform, podria ser un vectorizador o tfidf
                vectorizer = val

    for news in unclassified_news:
        # 2. Configurar el texto a analizar
        text_to_analyze = f"{news.get('title', '')} {news.get('description', '')}"
        
        try:
            # Procesar el texto si hay un vectorizer aislado en el diccionario
            input_data = [text_to_analyze]
            if vectorizer:
                input_data = vectorizer.transform(input_data)
                
            # 3. Hacer la predicción
            prediction = real_model.predict(input_data)[0]
            
            # Obtener probabilidad o score si el modelo lo soporta
            if hasattr(real_model, "predict_proba"):
                probabilities = real_model.predict_proba(input_data)[0]
                # Tomar la clase positiva (índice 1) si es binario:
                credibilidad = probabilities[1] if len(probabilities) > 1 else max(probabilities)
                credibility_score = round(float(credibilidad) * 100)
                classification = "reliable" if prediction == 1 else "unreliable"
            else:
                # Fallback
                credibility_score = float(prediction) * 100 if float(prediction) <= 1.0 else float(prediction)
                # Asumir umbral de 50 si el score es continuo
                classification = "reliable" if credibility_score > 50 else "unreliable"
                
            operations.append(
                UpdateOne(
                    {"_id": news["_id"]},
                    {"$set": {
                        "classification": classification,
                        "credibilityScore": credibility_score
                    }}
                )
            )
        except Exception as e:
            print(f"Error al predecir la noticia {news.get('_id')}: {e}")
            
    # 4. Actualizar la base de datos masivamente
    if operations:
        result = await db.top_news.bulk_write(operations)
        print(f"Clasificación terminada. Noticias actualizadas: {result.modified_count}")


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
    text_to_analyze = f"{documento.get('title', '')}. {documento.get('description', '')}"

    try:
        # Ejecucion de la arquitectura de agentes (LangGraph + CrewAI)
        # idealmente esta función debería ser asíncrona o correr en un hilo separado
        ai_result = await execute_analysis(text_to_analyze)

        await db.top_news.update_one(
            {"_id": ObjectId(news_id)},
            {"$set": {
                "classification": ai_result["verdict"].lower(),
                "credibilityScore": ai_result["score"]
            }}
        )

        return {
            "message": "Análisis completado",
            "news_id": news_id,
            "classification": ai_result["verdict"].lower(),
            "score": ai_result["score"]
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error en análisis con el módulo de IA: {str(e)}")
@app.post("/api/test-fetch")
async def test_fetch_news():
    """Endpoint de prueba para disparar manualmente la consulta"""
    await fetch_and_save_top_news()
    return {"message": "Proceso de fetch disparado manualmente. Revisa los logs."}

@app.post("/api/test-classify")
async def test_classify_news():
    """Endpoint para correr manualmente la pura clasificación"""
    try:
        await classify_unclassified_news()
        return {"message": "Proceso de clasificación disparado exitosamente."}
    except Exception as e:
        return {"message": f"Error: {e}"}

@app.post("/api/test-reset")
async def test_reset_news():
    """Endpoint para devolver todas las noticias al estado 'none' y remover sus scores. Útil para re-probar clasificaciones."""
    try:
        result = await db.top_news.update_many(
            {},
            {"$set": {
                "classification": "none",
                "credibilityScore": 0
            }}
        )
        return {"message": f"Se han reseteado {result.modified_count} noticias con éxito."}
    except Exception as e:
        return {"message": f"Error reseteando noticias: {e}"}

# Definir el esquema JSON que esperaremos de entrada para el nuevo endpoint
class NoticiaInput(BaseModel):
    title: str = ""
    text: str = ""

@app.post("/predict")
async def predecir_noticia(noticia: NoticiaInput):
    if modelo is None:
        raise HTTPException(status_code=503, detail="El modelo aún no está cargado.")
        
    titulo = noticia.title.strip()
    texto = noticia.text.strip()
    
    if not (titulo or texto):
        raise HTTPException(status_code=400, detail="Se requiere proveer 'title' o 'text' válido.")
        
    # Preparamos el texto a analizar
    texto_modelo = f"{titulo} {texto}".strip()
    
    real_model = modelo
    vectorizer = None
    if isinstance(modelo, dict):
        for key, val in modelo.items():
            if hasattr(val, "predict"):
                real_model = val
            elif hasattr(val, "transform") and not hasattr(val, "predict"):
                vectorizer = val
                
    input_data = [texto_modelo]
    if vectorizer:
        input_data = vectorizer.transform(input_data)
        
    if not hasattr(real_model, "predict_proba"):
        raise HTTPException(status_code=500, detail="El modelo cargado no soporta 'predict_proba'.")
    
    # Extraemos probabilidad
    proba = real_model.predict_proba(input_data)[0]
    
    # Manejar las clases
    if hasattr(real_model, "classes_"):
        clases = list(real_model.classes_)
        # Intenta usar 1 y 0, si no existen asume indices 1 y 0
        try:
            indice_clase_falsa = clases.index(1)
            indice_clase_verdadera = clases.index(0)
        except ValueError:
            indice_clase_falsa = 1 if len(clases) > 1 else 0
            indice_clase_verdadera = 0
    else:
        indice_clase_falsa = 1
        indice_clase_verdadera = 0
    
    prob_falsa = proba[indice_clase_falsa] if len(proba) > indice_clase_falsa else max(proba)
    prob_verdadera = proba[indice_clase_verdadera] if len(proba) > indice_clase_verdadera else 1 - prob_falsa
    
    # Clasificar con el umbral correspondiente
    if MODO_PREDICCION == "alta_precision":
        prediccion_numerica = int(prob_falsa >= umbral_precision_alta)
    else:
        prediccion_numerica = int(prob_falsa >= 0.5)
        
    etiqueta = "FALSA" if prediccion_numerica == 1 else "VERDADERA"
    credibilidad_pct = round(float(prob_verdadera) * 100, 2)
    
    # Retornar la respuesta final
    return {
        "prediccion": etiqueta,
        "probabilidad_falsa": float(prob_falsa),
        "probabilidad_verdadera": float(prob_verdadera),
        "credibilidad_pct": credibilidad_pct
    }
