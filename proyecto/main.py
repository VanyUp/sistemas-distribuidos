from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from jose import JWTError, jwt
from datetime import datetime, timedelta
from motor.motor_asyncio import AsyncIOMotorClient as MongoClient
from passlib.context import CryptContext
from bson.objectid import ObjectId
from models.models import UserRegister, UserLogin, Message
from openai import AsyncOpenAI
from dotenv import load_dotenv
import os

# =====================
# Configuración general
# =====================
app = FastAPI()

load_dotenv()

MONGO_URL = os.getenv("MONGO_URL")
DB_NAME = os.getenv("DB_NAME")
SECRET_KEY = os.getenv("SECRET_KEY")
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
newspsico_collection = db["noticias_psicologia"]

# JWT
SECRET_KEY_JWT = SECRET_KEY
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# =====================
# Funciones auxiliares
# =====================
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def decode_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload.get("sub")
    except JWTError:
        return None

# =====================
# Rutas HTML
# =====================
@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    # Traer noticias desde Mongo
    tarot_news = await newstarot_collection.find().sort("_id", -1).to_list(length=3)
    psico_news = await newspsico_collection.find().sort("_id", -1).to_list(length=3)

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
    return templates.TemplateResponse("noticias-tar.html", {"request": request})

# =====================
# API Endpoints
# =====================
@app.get("/api/noticia/{categoria}/{id}")
async def get_noticia(categoria: str, id: str):
    collection = newstarot_collection if categoria == "tarot" else newspsico_collection
    
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
                {"role": "system", "content": "Eres un asistente directo de tarot y psicología con respuestas breves y concisas. No brindas otros consejos. Si la consulta no es sobre tarot o psicología, indicas que no puedes ayudar. Humor Gen Z."},
                {"role": "user", "content": message.text},
            ]
        )
        return {"reply": response.choices[0].message.content}
    
    except Exception as e:
        print("❌ Error en backend:", e)
        return {"reply": f"⚠️ Error en el servidor: {str(e)}"}