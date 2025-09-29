from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from apscheduler.schedulers.background import BackgroundScheduler
from motor.motor_asyncio import AsyncIOMotorClient as MongoClient
from bson.objectid import ObjectId
from models.models import UserRegister, UserLogin, Message
from models.functions import get_password_hash, verify_password, create_access_token, decode_token, scrap_tarot, scrap_psicologia
from openai import AsyncOpenAI
from dotenv import load_dotenv
import os
import atexit
import asyncio

# =====================
# Configuración general
# =====================
app = FastAPI()

load_dotenv()

MONGO_URL = os.getenv("MONGO_URL")
DB_NAME = os.getenv("DB_NAME")
API_KEY = os.getenv("OPENAI_API_KEY")

openai_client = AsyncOpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=API_KEY,
)

templates = Jinja2Templates(directory="templates")
app.mount("/static", StaticFiles(directory="static"), name="static")

# Mongo
client = MongoClient(MONGO_URL)
try:
    client.admin.command("ping")
    print("✅ Conexión a MongoDB Atlas exitosa")
except Exception as e:
    print("❌ Error al conectar con MongoDB Atlas:", e)
db = client[DB_NAME]
users_collection = db["users"]
newstarot_collection = db["noticias_tarot"]
newspsi_collection = db["noticias_psicologia"]

# =====================
# Rutas HTML
# =====================
@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    # Traer noticias desde Mongo
    tarot_news = await newstarot_collection.find().sort("_id", -1).to_list(length=3)
    psico_news = await newspsi_collection.find().sort("_id", -1).to_list(length=3)

    # Convertir ObjectId a str para evitar problemas
    for n in tarot_news + psico_news:
        n["_id"] = str(n["_id"])

    return templates.TemplateResponse("index.html", {
        "request": request,
        "tarot_news": tarot_news,
        "psico_news": psico_news
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

@app.get("/noticias-psi", response_class=HTMLResponse)
async def noticias_psico(request: Request):
    psico_news = await newspsi_collection.find().sort("_id", -1).to_list(30)
    for n in psico_news:
        n["_id"] = str(n["_id"])

    featured = psico_news[0] if psico_news else None
    return templates.TemplateResponse("noticias-psi.html", {
        "request": request, 
        "psico_news": psico_news, 
        "featured_news": featured}
    )

@app.get("/chat-psi", response_class=HTMLResponse)
async def get_chat_psi(request: Request):
    return templates.TemplateResponse("chat-psi.html", {"request": request})
    

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

@app.post("/api/register")
async def register(user: UserRegister):
    existing_user = await users_collection.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="El correo ya está registrado")
    
    hashed_pw = get_password_hash(user.password)
    user_data = {"username": user.username, "email": user.email, "hashed_password": hashed_pw}
    result = await users_collection.insert_one(user_data)

    return {"msg": "Usuario registrado con éxito", "id": str(result.inserted_id)}

@app.post("/api/login")
async def login(user: UserLogin):
    db_user = await users_collection.find_one({"email": user.email})
    if not db_user or not verify_password(user.password, db_user["hashed_password"]):
        raise HTTPException(status_code=400, detail="Credenciales inválidas")
    
    access_token = create_access_token(data={"sub": str(db_user["_id"])})
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/api/chat")
async def chat(message: Message):
    user_id = decode_token(message.token)
    if not user_id:
        raise HTTPException(status_code=401, detail="No autorizado")
    
    try:
        response = await openai_client.chat.completions.create(
            model="gpt-oss-120b",
            messages=[
                {"role": "system", "content": "Eres un asistente directo de tarot con respuestas breves y concisas, brindas otros consejos. Si la consulta no es sobre tarot, indicas como puedes ayudar. Humor Gen Z."},
                {"role": "user", "content": message.text},
            ]
        )
        return {"reply": response.choices[0].message.content}
    
    except Exception as e:
        print("❌ Error en backend:", e)
        return {"reply": f"⚠️ Error en el servidor: {str(e)}"}
    
loop = None  # 👈 variable global para guardar el loop principal


#chat psicolo
# Vista HTML


# Endpoint de IA
@app.post("/api/chat/psi")
async def chat_psi(message: Message):
    user_id = decode_token(message.token)
    if not user_id:
        raise HTTPException(status_code=401, detail="No autorizado")

    try:
        resp = await openai_client.chat.completions.create(
            model="gpt-oss-120b",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "Eres un asistente **psicológico no clínico** en español. "
                        "Brindas psicoeducación, técnicas de afrontamiento básicas "
                        "(respiración, journaling, reestructuración cognitiva simple), "
                        "validas y rediriges a profesionales. No haces diagnósticos ni tratamiento. "
                        "Si hay riesgo o crisis, indicas contactar líneas de emergencia locales."
                    ),
                },
                {"role": "user", "content": message.text},
            ],
            temperature=0.5,
        )
        return {"reply": resp.choices[0].message.content}
    except Exception as e:
        print("❌ Error chat-psi:", e)
        return {"reply": "⚠️ Error del servidor"}


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

