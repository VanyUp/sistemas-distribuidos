from fastapi import FastAPI, HTTPException
from models.dulces import Dulces
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId

app = FastAPI(title="Gestión de Dulces")

# Conexión con MongoDB
client = AsyncIOMotorClient("mongodb+srv://danylugo352:vany123.@clustersisdis.zrptqzd.mongodb.net/")
db = client["Productos"]
collection = db["Dulces"]

# Helper para ObjectId
def dulces_helper(dulces) -> dict:
    return {
        "id": str(dulces["_id"]),
        "nombre": dulces["nombre"],
        "tipo": dulces["tipo"],
        "sabor": dulces["sabor"],
        "precio": dulces["precio"],
        "origen": dulces["origen"],
        "disponible": dulces["disponible"],
        "stock": dulces["stock"]
    }

@app.get("/")
async def inicio():
    return {"mensaje": "Hola Mundo!"}

# POST - Crear
@app.post("/dulces/")
async def crear_dulce(dulces: Dulces):
    nuevo = await collection.insert_one(dulces.dict())
    creado = await collection.find_one({"_id": nuevo.inserted_id})
    return dulces_helper(creado)

# GET - Listar todos
@app.get("/dulces/")
async def listar_dulce():
    portatiles = []
    async for p in collection.find():
        portatiles.append(dulces_helper(p))
    return portatiles

# GET - Buscar por ID
@app.get("/dulces/{id}")
async def buscar_dulce(id: str):
    portatil = await collection.find_one({"_id": ObjectId(id)})
    if not portatil:
        raise HTTPException(status_code=404, detail="Dulce no encontrado")
    return dulces_helper(portatil)

# PATCH - Actualizar
@app.patch("/dulces/{id}")
async def actualizar_dulce(id: str, datos: dict):
    result = await collection.update_one(
        {"_id": ObjectId(id)},
        {"$set": datos}
    )
    return {"mensaje": "Dulce actualizado correctamente"}

# DELETE - Eliminar
@app.delete("/dulces/{id}")
async def eliminar_dulce(id: str):
    eliminado = await collection.find_one_and_delete({"_id": ObjectId(id)})
    if not eliminado:
        raise HTTPException(status_code=404, detail="Dulce no encontrado")
    return {"mensaje": "Dulce eliminado correctamente"}