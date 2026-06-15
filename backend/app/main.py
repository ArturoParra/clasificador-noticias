from datetime import datetime
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
import asyncio
from pymongo import UpdateOne
from bs4 import BeautifulSoup
import uuid # para generar IDs únicos si es necesario en la función de búsqueda, aunque MongoDB ya genera ObjectId automáticamente

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
        "publish_date": news.get("publish_date", news.get("publishedAt", "")),
        "source": news.get("source", ""),
        "image": news.get("image", ""),
        "category": news.get("category", ""),
        "classification": news.get("classification", "none"),
        "credibilityScore": news.get("credibilityScore", 0),
        "summary": news.get("summary", ""),
    }

async def fetch_and_save_top_news():
    print("Iniciando la búsqueda de las top 10 noticias...")
    
    NEWS_API_URL = "https://api.worldnewsapi.com/top-news"
    params = {
        "api-key": os.getenv("WORLD_NEWS_API_KEY"), 
        "source-country": "mx",
        "language": "es", 
        "max-news-per-cluster": 1,
        "headlines-only": "false",
        "date": datetime.now().strftime("%Y-%m-%d")
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
                            "summary": article.get("summary", ""),
                            "url": article.get("url", ""),
                            "publish_date": article.get("publish_date", ""),
                            "source": article.get("author", ""), # API no anida source.name normalmente
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

"""
async def classify_unclassified_news():
    print("Iniciando clasificación con agentes de IA...")
    
    # 1. Obtener las noticias que no han sido clasificadas
    cursor = db.top_news.find({"classification": "none"}).limit(3) # limite de rpm para evitar saturar la API de Google Gemini
    unclassified_news = await cursor.to_list(length=None)
    
    if not unclassified_news:
        print("No hay noticias pendientes por clasificar.")
        return

    total_news = len(unclassified_news)
    print(f"Se encontraron {total_news} noticias...")
    operations = []

    for index, news in enumerate(unclassified_news):
        text_to_analyze = f"{news.get('title', '')} {news.get('description', '')}"
        
        try:
            print(f"[{index + 1}/{total_news}] Desplegando agentes para: {news.get('_id')}")
            
            # Envio exclusivo a CrewAI
            ai_result = await execute_analysis(text_to_analyze)
            classification = ai_result["verdict"].lower()
            credibility_score = ai_result["score"]

            # Preparamos la orden de actualizacion para MongoDB
            operations.append(
                UpdateOne(
                    {"_id": news["_id"]},
                    {"$set": {
                        "classification": classification,
                        "credibilityScore": credibility_score
                    }}
                )
            )

            # Si no es la última noticia de la lista, hacemos una pausa para enfriar la API
            if index < total_news - 1:
                tiempo_espera = 30  # 30 segundos de pausa entre cada noticia
                print(f"Pausando {tiempo_espera}s para enfriar la cuota de Google Gemini...")
                await asyncio.sleep(tiempo_espera)

        except Exception as e:
            print(f"Error al procesar la noticia {news.get('_id')}: {e}")
            # Si aún con la pausa Google nos lanza el Error 429, rompemos el ciclo
            # para no seguir fallando y guardamos lo que ya se logró procesar.
            if "429" in str(e):
                print("Límite de API alcanzado. Deteniendo el procesamiento por ahora.")
                break
            
    # 4. Actualizar la base de datos masivamente
    if operations:
        result = await db.top_news.bulk_write(operations)
        print(f"Lote terminado. Noticias analizadas exclusivamente por IA: {result.modified_count}")
"""

async def classify_unclassified_news():
    print("Iniciando clasificación masiva (Arquitectura Híbrida)...")
    
    # Traemos todas las noticias pendientes
    cursor = db.top_news.find({"classification": "none"})
    unclassified_news = await cursor.to_list(length=None)
    
    if not unclassified_news:
        print("No hay noticias pendientes. ¡La base de datos está al día!")
        return

    operations = []
    # nueva variable para el lote de noticias antes del guardado de seguridad
    BATCH_SIZE = 50
    total_news = len(unclassified_news)
    saved_news_count = 0
    print(f"Se evaluarán {total_news} noticias.")
    
    # Preparamos el modelo local por si la IA se queda sin tokens
    real_model = modelo
    vectorizer = None
    if isinstance(modelo, dict):
        for key, val in modelo.items():
            if hasattr(val, "predict"):
                real_model = val
            elif hasattr(val, "transform") and not hasattr(val, "predict"):
                vectorizer = val

    # Procesamiento de las noticias
    for index, news in enumerate(unclassified_news):
        text_to_analyze = f"{news.get('title', '')} {news.get('description', '')}"
        
        try:
            # uso de IA para clasificación, con respaldo de modelo local en caso de error (ej: límite de tokens)
            print(f"[{index + 1}/{total_news}] Intentando IA para: {news.get('_id')}")
            ai_result = await execute_analysis(text_to_analyze)
            classification = ai_result["verdict"].lower()
            final_score = ai_result["score"]
            used_engine = "IA_Agentes"

            # Pequeña pausa para no saturar el RPM de Google
            await asyncio.sleep(2)

        except Exception as e:
            # intento con modelo local si la IA falla (ej: límite de tokens)
            print(f"Límite de IA alcanzado. Usando modelo local rápido para {news.get('_id')}...")
            used_engine = "Modelo_Local_Respaldo"
            
            input_data = [text_to_analyze]
            if vectorizer:
                input_data = vectorizer.transform(input_data)
                
            # se usa predict_proba en lugar de predict para obtener la confianza de la predicción
            proba = real_model.predict_proba(input_data)[0]
            
            # Identificación de clases para asegurar que tomamos la probabilidad correcta
            if hasattr(real_model, "classes_"):
                clases = list(real_model.classes_)
                try:
                    indice_clase_falsa = clases.index(1)
                    indice_clase_verdadera = clases.index(0)
                except ValueError:
                    indice_clase_falsa = 1 if len(clases) > 1 else 0
                    indice_clase_verdadera = 0
            else:
                indice_clase_falsa = 1
                indice_clase_verdadera = 0
                
            false_prob = proba[indice_clase_falsa] if len(proba) > indice_clase_falsa else max(proba)
            true_prob = proba[indice_clase_verdadera] if len(proba) > indice_clase_verdadera else 1 - false_prob
            
            final_score = round(float(true_prob) * 100)
            classification = "falsa" if false_prob >= 0.5 else "verdadera"

        # 3. Preparamos la orden de actualización
        operations.append(
            UpdateOne(
                {"_id": news["_id"]},
                {"$set": {
                    "classification": classification,
                    "credibilityScore": final_score,
                    "engine": used_engine
                }}
            )
        )

        # checkpoint de guardado cada cierto número de noticias
        if len(operations) >= BATCH_SIZE:
            await db.top_news.bulk_write(operations)
            saved_news_count += len(operations)
            print(f"¡Punto de control! {saved_news_count}/{total_news} noticias aseguradas en MongoDB.")
            operations = [] # Limpieza de la memoria para el siguiente lote
            
    # Guardado masivo en la DB
    if operations:
        await db.top_news.bulk_write(operations)
        saved_news_count += len(operations)

    print(f"Clasificación terminada. Noticias procesadas y guardadas: {saved_news_count}")

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

    Se evalúa primero con el modelo local .pkl
    Si la credibilidad es <= 60, se despliega la arquitectura de agentes
    """
    if not ObjectId.is_valid(news_id):
        raise HTTPException(status_code=400, detail="ID de noticia inválido")

    # busqueda de la noticia en la DB
    document = await db.top_news.find_one({"_id": ObjectId(news_id)})
    if not document:
        raise HTTPException(status_code=404, detail="Noticia no encontrada")

    # construccion del texto
    text_to_analyze = f"{document.get('title', '')}. {document.get('description', '')}"

    try:
        # Evaluacion con modelo local
        if modelo is None:
            raise HTTPException(status_code=503, detail="El modelo local aún no está cargado.")
        # Extraccion del modelo y vectorizador
        real_model = modelo
        vectorizer = None
        if isinstance(modelo, dict):
            for key, val in modelo.items():
                if hasattr(val, "predict"):
                    real_model = val
                elif hasattr(val, "transform") and not hasattr(val, "predict"):
                    vectorizer = val

        input_data = [text_to_analyze]
        if vectorizer:
            input_data = vectorizer.transform(input_data)

        # calculo de probabilidad o score
        proba = real_model.predict_proba(input_data)[0]

        #identificacion de clases
        if hasattr(real_model, "classes_"):
            clases = list(real_model.classes_)
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

        # Conversion de la probabilidad a un puntaje de 0 a 100
        puntaje_local = round(float(prob_verdadera) * 100)

            # Decisión del modelo local
        if MODO_PREDICCION == "alta_precision":
            prediccion_numerica = int(prob_falsa >= umbral_precision_alta)
        else:
            prediccion_numerica = int(prob_falsa >= 0.5)
            
        clasificacion_local = "falsa" if prediccion_numerica == 1 else "verdadera"

        # enrutador condicional
        if puntaje_local <= 60:
            # Puntuación baja: Entra la arquitectura de Agentes LLM
            ai_result = await execute_analysis(text_to_analyze)
            veredicto_final = ai_result["verdict"].lower()
            score_final = ai_result["score"]
            motor_utilizado = "Agentes_LLM_LangGraph"
        else:
            # Puntuación alta: Confiamos en el modelo local
            veredicto_final = clasificacion_local
            score_final = puntaje_local
            motor_utilizado = "Modelo_Local_PKL"

        # Actualizacion en la DB
        await db.top_news.update_one(
            {"_id": ObjectId(news_id)},
            {"$set": {
                "classification": veredicto_final,
                "credibilityScore": score_final
            }}
        )

        return {
            "message": "Análisis completado",
            "news_id": news_id,
            "classification": veredicto_final,
            "score": score_final,
            "motor": motor_utilizado 
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error en análisis con el módulo de IA: {str(e)}")

# nuevo endpoint para clasificacion de URLs
class URLRequest(BaseModel):
    url: str # se define el esquema de entrada para recibir una URL a analizar

# endpoint de análisis de URL externas
@app.post("/api/analyze-external")
async def analyze_external_url(request: URLRequest):
    print(f"Analizando URL externa: {request.url}")
    try:
        # scrapping de la pagina para extraer el texto
        # para dicho scrapping, se enmascara el user-agent para evitar bloqueos básicos de algunos sitios web
        # esto definiendo las siguientes cabeceras
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
            "Accept-Language": "es-MX,es;q=0.9,en;q=0.8"
        }

        # pasamos las cabeceras a la sesion de aiohttp para el scrapping
        async with aiohttp.ClientSession(headers=headers) as session:
            async with session.get(request.url) as response:
                # Verificamos que el sitio nos haya dejado entrar (Código 200)
                response.raise_for_status()

                html = await response.text()
                soup = BeautifulSoup(html, 'html.parser')

                # Extraccion del titulo y los primeros 5 parrafos
                title = soup.title.string if soup.title else "Noticia externa sin titulo"
                all_paragraphs = soup.find_all('p')

                # Filtramos solo guardando los que tengan texto real (más de 40 caracteres)
                valid_paragraphs = [
                    p.get_text(strip=True) 
                    for p in all_paragraphs 
                    if len(p.get_text(strip=True)) > 40
                ]
                
                # tomamos los primeros 5 parrafos validos y los unimos
                body = " ".join(valid_paragraphs[:5]) # Limitar a los primeros 5 parrafos para no saturar la IA

                text_to_analyze = f"{title}. {body}"
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al extraer texto de la URL: {str(e)}")

    # llamado a la arquitectura de clasificacion hibrida sin persistencia en DB
    real_model = modelo
    vectorizer = None
    if isinstance(modelo, dict):
        for key, val in modelo.items():
            if hasattr(val, "predict"):
                real_model = val
            elif hasattr(val, "transform") and not hasattr(val, "predict"):
                vectorizer = val

    try:
        # Primero se intenta con los agentes de IA
        print("Enviando URL a los agentes de IA...")
        ai_result = await execute_analysis(text_to_analyze)
        classification = ai_result["verdict"].lower()
        final_score = ai_result["score"]
        used_engine = "IA_Agentes"
    except Exception as e:
        # Si la IA falla, se procede con el modelo local como respaldo
        print("IA ocupada/sin tokens. Usando modelo local para la URL...")
        used_engine = "Modelo_Local_Respaldo"
        input_data = [text_to_analyze]
        if vectorizer:
            input_data = vectorizer.transform(input_data)
        
        proba = real_model.predict_proba(input_data)[0]
        
        # logica para identificar correctamente las clases y sus probabilidades
        if hasattr(real_model, "classes_"):
            clases = list(real_model.classes_)
            indice_clase_falsa = clases.index(1) if 1 in clases else 1
            indice_clase_verdadera = clases.index(0) if 0 in clases else 0
        else:
            indice_clase_falsa, indice_clase_verdadera = 1, 0
            
        false_prob = proba[indice_clase_falsa] if len(proba) > indice_clase_falsa else max(proba)
        true_prob = proba[indice_clase_verdadera] if len(proba) > indice_clase_verdadera else 1 - false_prob
        
        final_score = round(float(true_prob) * 100)
        classification = "falsa" if false_prob >= 0.5 else "verdadera"

    # Se devuelve la respuesta con las claves exactas que espera el frontend
    external_id = f"external-{uuid.uuid4()}"
    return {
        "id": external_id,             # Cambiado de _id a id
        "_id": external_id,            # Por si MongoDB lo requiere internamente
        "title": title,
        "description": body[:150] + "...",
        "content": body,               # Agregado para la vista de detalles
        "classification": classification,
        "credibilityScore": final_score,
        "engine": used_engine,
        "image": "https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=800",
        "url": request.url,
        "source": "Enlace Externo",    # Agregado para el Badge
        "date": "Justo ahora"          # Agregado para el subtítulo
    }

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
