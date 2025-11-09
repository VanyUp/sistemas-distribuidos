from fastapi import FastAPI
from models import Libro, UsuarioLogin, UsuarioRegistro, Message
from fastapi import HTTPException
from database import supabase
from passlib.hash import bcrypt
from dotenv import load_dotenv
import os
from openai import AsyncOpenAI

load_dotenv()



app = FastAPI()

API_KEY = os.getenv("API_KEY")


openai_client = AsyncOpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key= API_KEY,
)

@app.post("/usuarios/register")
def registrar_usuario(usuario: UsuarioRegistro):
    try:
        existente = supabase.table("usuarios").select("*").eq("email", usuario.email).execute()
        if existente.data:
            raise HTTPException(status_code=400, detail="El usuario ya existe")

        hashed = bcrypt.hash(usuario.password)

        nuevo = {
            "username": usuario.username,
            "email": usuario.email,
            "hashed_password": hashed
        }

        res = supabase.table("usuarios").insert(nuevo).execute()
        print(res)
        return {"mensaje": "Usuario registrado correctamente", "debug": res}
    except Exception as e:
        print("❌ Error:", e)
        raise HTTPException(status_code=500, detail=str(e))


# --- Login ---
@app.post("/usuarios/login")
def login_usuario(usuario: UsuarioLogin):
    res = supabase.table("usuarios").select("*").eq("email", usuario.email).execute()

    if not res.data:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    usuario_db = res.data[0]
    if not bcrypt.verify(usuario.password, usuario_db["hashed_password"]):
        raise HTTPException(status_code=401, detail="Contraseña incorrecta")

    return {"mensaje": f"Bienvenido {usuario_db['username']}"}



@app.get("/libros")
def listar_libros():
    response = supabase.table("libros").select("*").execute()
    return response.data

@app.post("/libros")
def agregar_libro(libro: Libro):
    response = supabase.table("libros").insert(libro.dict()).execute()
    return response.data

@app.put("/libros/{id}")
def actualizar_libro(id: int, libro: Libro):
    response = supabase.table("libros").update(libro.dict()).eq("id", id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Libro no encontrado")
    return response.data

@app.delete("/libros/{id}")
def eliminar_libro(id: int):
    response = supabase.table("libros").delete().eq("id", id).execute()
    return {"deleted": len(response.data)}


@app.post("/api/chat")
async def chat(message: Message):   
    try:
        response = await openai_client.chat.completions.create(
            model="gpt-oss-120b",
            messages=[
                {"role": "system", "content": "Eres un asistente bibliotecario, puedes dar recomendaciones de cualquier genero que te pregunten. Humor Gen Z."},
                {"role": "user", "content": message.text},
            ]
        )
        return {"reply": response.choices[0].message.content}
    
    except Exception as e:
        print("❌ Error en backend:", e)
        return {"reply": f"⚠️ Error en el servidor: {str(e)}"}
    
loop = None  # 👈 variable global para guardar el loop principal