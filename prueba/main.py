from fastapi import FastAPI
from models import Libro
from database import supabase

app = FastAPI()

@app.get("/libros")
def listar_libros():
    response = supabase.table("libros").select("*").execute()
    return response.data

@app.post("/libros")
def agregar_libro(libro: Libro):
    response = supabase.table("libros").insert(libro.dict()).execute()
    return response.data

@app.delete("/libros/{id}")
def eliminar_libro(id: int):
    response = supabase.table("libros").delete().eq("id", id).execute()
    return {"deleted": len(response.data)}
