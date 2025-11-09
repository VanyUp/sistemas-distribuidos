from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from apscheduler.schedulers.background import BackgroundScheduler
from motor.motor_asyncio import AsyncIOMotorClient as MongoClient
from bson.objectid import ObjectId
from models.models import UserRegister, UserLogin, Message, UsuarioRegistro, UsuarioLogin
from supabase import create_client, Client
from models.functions import get_password_hash, verify_password, create_access_token, decode_token, scrap_tarot, scrap_psicologia
from openai import AsyncOpenAI
from dotenv import load_dotenv
import os
import atexit
import asyncio
from models import Libro
from database import supabase

# =====================
# Configuración general
# =====================
app = FastAPI()

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
DB_NAME = os.getenv("DB_NAME")
API_KEY = os.getenv("OPENAI_API_KEY")

openai_client = AsyncOpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=API_KEY,
)

templates = Jinja2Templates(directory="templates")
app.mount("/static", StaticFiles(directory="static"), name="static")

# SUPABASE
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

try:
    response = supabase.table("libros").select("*").limit(1).execute()
    print("✅ Conexión a Supabase exitosa")
except Exception as e:
    print("❌ Error al conectar con Supabase:", e)


usuarios = supabase.table("users")
noticias_tarot = supabase.table("noticias_tarot") # traer los libros



# =====================
# Rutas HTML
# =====================
@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    # Traer noticias desde Mongo
    tarot_news = await newstarot_collection.find().sort("_id", -1).to_list(length=3)
    # Convertir ObjectId a str para evitar problemas
    for n in tarot_news:
        n["_id"] = str(n["_id"])

    return templates.TemplateResponse("index.html", {
        "request": request,
        "tarot_news": tarot_news,
    })

@app.get("/register", response_class=HTMLResponse)
async def get_register(request: Request):
    return templates.TemplateResponse("registro.html", {"request": request})

@app.get("/login", response_class=HTMLResponse)
async def get_login(request: Request):
    return templates.TemplateResponse("login.html", {"request": request})

@app.get("/seleccion", response_class=HTMLResponse)
async def get_seleccion(request: Request):
    return templates.TemplateResponse("seleccion.html", {"request": request})

@app.get("/chat-tar", response_class=HTMLResponse)
async def get_chat(request: Request):
    return templates.TemplateResponse("chat-tar.html", {"request": request})

@app.get("/noticias-tar", response_class=HTMLResponse)
async def get_noticias_tar(request: Request):
    tarot_news = await newstarot_collection.find().sort("_id", -1).to_list(length=7)

    for n in tarot_news:
        n["_id"] = str(n["_id"])

    featured_news = tarot_news[0] if tarot_news else None
    tarot_news = tarot_news[1:] if len(tarot_news) > 1 else []

    
    return templates.TemplateResponse("noticias-tar.html", {
        "request": request,
        "featured_news": featured_news,
        "tarot_news": tarot_news
    })



# =====================
# API Endpoints
# =====================
@app.get("/api/noticia/{categoria}/{id}")
async def get_noticia(categoria: str, id: str):
    collection = newstarot_collection if categoria == "tarot" else newspsi_collection
    
    noticia = await collection.find_one({"_id": ObjectId(id)})
    
    if noticia:
        noticia["_id"] = str(noticia["_id"])
        return JSONResponse(content=noticia)

    return JSONResponse(content={"error": "Noticia no encontrada"}, status_code=404)

#register
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


#login
@app.post("/usuarios/login")
def login_usuario(usuario: UsuarioLogin):
    res = supabase.table("usuarios").select("*").eq("email", usuario.email).execute()

    if not res.data:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    usuario_db = res.data[0]
    if not bcrypt.verify(usuario.password, usuario_db["hashed_password"]):
        raise HTTPException(status_code=401, detail="Contraseña incorrecta")

    return {"mensaje": f"Bienvenido {usuario_db['username']}"}





@app.post("/api/chat")
async def chat(message: Message):
    user_id = decode_token(message.token)
    if not user_id:
        raise HTTPException(status_code=401, detail="No autorizado")
    
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





@app.on_event("startup")
async def start_scheduler():
    global loop
    loop = asyncio.get_event_loop()  # 👈 guarda el loop principal de FastAPI

    scheduler = BackgroundScheduler()

    def job_wrapper():
        asyncio.run_coroutine_threadsafe(scrap_tarot(newstarot_collection), loop)

    def job_psico():
        asyncio.run_coroutine_threadsafe(scrap_psicologia(newspsi_collection), loop)


    scheduler.add_job(job_wrapper, "interval", minutes=2)
    scheduler.add_job(job_psico, "interval", minutes=2)
    scheduler.start()
    print("⏳ Scraper automático cada 2 minutos iniciado")
    atexit.register(lambda: scheduler.shutdown())

