from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.responses import HTMLResponse
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
news_collection = db["noticias"]

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
async def get_index(request: Request):
    index = await news_collection.find({}, {"_id": 0}).to_list(length=None)
    return templates.TemplateResponse("index.html", {"request": request, "index": index})

@app.get("/register", response_class=HTMLResponse)
async def get_register(request: Request):
    return templates.TemplateResponse("registro.html", {"request": request})

@app.get("/login", response_class=HTMLResponse)
async def get_login(request: Request):
    return templates.TemplateResponse("login.html", {"request": request})

@app.get("/chat", response_class=HTMLResponse)
async def get_chat(request: Request):
    return templates.TemplateResponse("chat.html", {"request": request})

# =====================
# API Endpoints
# =====================
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
                {"role": "system", "content": "Eres un asistente directo y con humor Gen Z."},
                {"role": "user", "content": message.text},
            ]
        )
        return {"reply": response.choices[0].message.content}
    
    except Exception as e:
        print("❌ Error en backend:", e)
        return {"reply": f"⚠️ Error en el servidor: {str(e)}"}