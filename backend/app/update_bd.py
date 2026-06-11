import asyncio
import os
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import UpdateOne

# Cargar las variables de entorno (.env) donde tienes MONGO_URL
load_dotenv()


async def refactorize_news_dates():
    client = AsyncIOMotorClient(os.getenv("MONGO_URL"))
    db = client[os.getenv("MONGO_DB_NAME")]

    print("Iniciando refactorización de fechas de noticias...")

    cursor = db.top_news.find({
        "$or": [
            {"publishedAt": {"$exists": True, "$nin": [None, ""]}},
            {"publish_date": {"$exists": False}},
            {"publish_date": None},
            {"publish_date": ""}
        ]
    })
    documents = await cursor.to_list(length=None)

    if not documents:
        print("No se encontraron documentos para refactorizar.")
        return

    operations = []

    for document in documents:
        publish_date = document.get("publish_date") or document.get("publishedAt") or ""

        if not publish_date:
            continue

        operations.append(
            UpdateOne(
                {"_id": document["_id"]},
                {
                    "$set": {"publish_date": publish_date},
                    "$unset": {"publishedAt": ""}
                }
            )
        )

    if operations:
        result = await db.top_news.bulk_write(operations)
        print(f"Noticias refactorizadas: {result.modified_count}")
    else:
        print("No fue necesario actualizar ningún documento.")


async def update_documents():
    client = AsyncIOMotorClient(os.getenv("MONGO_URL"))
    db = client[os.getenv("MONGO_DB_NAME")]
    
    print("Conectando a la base de datos...")

    # update_many actualiza múltiples documentos. 
    # El primer parámetro {} vacío significa que aplica a TODOS los documentos en la colección top_news
    # El segundo parámetro {$set: {...}} define los campos a agregar o actualizar
        # Usamos $or para encontrar documentos donde el campo no exista o sea nulo/vacío
    query = {
        "$or": [
            {"classification": {"$exists": False}},
            {"classification": None},
            {"classification": ""}
        ]
    }
    
    result = await db.top_news.update_many(
        query,
        {"$set": {
            "classification": "none"
        }}
    )
    print(f"Classification actualizados: {result.modified_count}")

    # Hacemos lo mismo para credibilityScore
    query_score = {
        "$or": [
            {"credibilityScore": {"$exists": False}},
            {"credibilityScore": None}
        ]
    }
    result_score = await db.top_news.update_many(
        query_score,
        {"$set": {
            "credibilityScore": 0
        }}
    )
    print(f"Score actualizados: {result_score.modified_count}")

    # Y lo mismo para imageUrl
    query_img = {
        "$or": [
            {"imageUrl": {"$exists": False}},
            {"imageUrl": None},
            {"imageUrl": ""}
        ]
    }
    result_img = await db.top_news.update_many(
        query_img,
        {"$set": {
            "imageUrl": "https://via.placeholder.com/400x250?text=No+Image"
        }}
    )
    print(f"Imágenes actualizadas: {result_img.modified_count}")
    
    print(f"Proceso finalizado. Documentos modificados: {result.modified_count}")

if __name__ == "__main__":
    asyncio.run(refactorize_news_dates())