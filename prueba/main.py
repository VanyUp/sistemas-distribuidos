from fastapi import FastAPI
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from models.models import Libro, UsuarioLogin, UsuarioRegistro, Message
from fastapi import HTTPException
from models.database import supabase
from passlib.hash import bcrypt
from dotenv import load_dotenv
import os
from openai import AsyncOpenAI

load_dotenv()

app = FastAPI()

API_KEY = os.getenv("API_KEY")

# Configuración del cliente OpenAI
openai_client = AsyncOpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key= API_KEY,
)

# Configuración de plantillas y archivos estáticos
templates = Jinja2Templates(directory="templates")
app.mount("/static", StaticFiles(directory="static"), name="static")

# =====================
# Interfaces de usuario
# =====================

# ===== Módulo de clientes =====

# --- Página principal ---
@app.get("/", response_class=HTMLResponse)
async def home(request):
    return templates.TemplateResponse("index.html", {"request": request})

# --- Página de registro ---
@app.get("/register", response_class=HTMLResponse)
async def get_register(request):
    return templates.TemplateResponse("registro.html", {"request": request})

# --- Página de login ---
@app.get("/login", response_class=HTMLResponse)
async def get_login(request):
    return templates.TemplateResponse("login.html", {"request": request})

# --- Inicio/Catálogo de libros ---
@app.get("/catalogo", response_class=HTMLResponse)
async def get_catalogo(request):
    return templates.TemplateResponse("catalogo.html", {"request": request})

# --- Detalles del libro ---
@app.get("/libro/{id}", response_class=HTMLResponse)
async def get_libro(request, id: int):
    return templates.TemplateResponse("libro.html", {"request": request, "libro_id": id})

# --- Carrito de compras ---
@app.get("/carrito", response_class=HTMLResponse)
async def get_carrito(request):
    return templates.TemplateResponse("carrito.html", {"request": request})

# --- Pago y confirmación ---
@app.get("/pago", response_class=HTMLResponse)
async def get_pago(request):
    return templates.TemplateResponse("pago.html", {"request": request})

# --- Historial de pedidos ---
@app.get("/historial", response_class=HTMLResponse)
async def get_historial(request):
    return templates.TemplateResponse("historial.html", {"request": request})

# --- Perfil de usuario ---
@app.get("/perfil", response_class=HTMLResponse)
async def get_perfil(request):
    return templates.TemplateResponse("perfil.html", {"request": request})

# ===== Módulo de administración =====

# --- Dashboard ---
@app.get("/admin", response_class=HTMLResponse)
async def get_admin_dashboard(request):
    return templates.TemplateResponse("admin/dashboard.html", {"request": request})

# --- Gestión de usuarios ---
@app.get("/admin/usuarios", response_class=HTMLResponse)
async def get_admin_usuarios(request):
    return templates.TemplateResponse("admin/usuarios.html", {"request": request})

# --- Gestión de libros ---
@app.get("/admin/libros", response_class=HTMLResponse)
async def get_admin_libros(request):
    return templates.TemplateResponse("admin/libros.html", {"request": request})

# --- Gestión de pedidos ---
@app.get("/admin/pedidos", response_class=HTMLResponse)
async def get_admin_pedidos(request):
    return templates.TemplateResponse("admin/pedidos.html", {"request": request})

# --- Gestión de prooveedores/compras ---
@app.get("/admin/proveedores", response_class=HTMLResponse)
async def get_admin_proveedores(request):
    return templates.TemplateResponse("admin/proveedores.html", {"request": request})

# --- Reportes y estadísticas ---
@app.get("/admin/reportes", response_class=HTMLResponse)
async def get_admin_reportes(request):
    return templates.TemplateResponse("admin/reportes.html", {"request": request})


# =======================
# Interfaces de Servicios
# =======================

# --- Registro ---
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


# --- Gestión de Libros ---
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

# --- Chat con OpenAI ---
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


# =========================
# Interfaces de Integración
# =========================