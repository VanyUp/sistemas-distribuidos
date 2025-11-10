from fastapi import FastAPI, Request, Form
from fastapi.responses import HTMLResponse, RedirectResponse, JSONResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from models.models import Libro, UsuarioLogin, UsuarioRegistro
from fastapi import HTTPException
from passlib.hash import bcrypt
from supabase import create_client
from dotenv import load_dotenv
import os

load_dotenv()

app = FastAPI()

url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_KEY")

supabase = create_client(url, key)

# Configuración de plantillas y archivos estáticos
templates = Jinja2Templates(directory="templates")
app.mount("/static", StaticFiles(directory="static"), name="static")

# =====================
# Interfaces de usuario
# =====================


@app.post("/agregar_libro")
async def agregar_libro(libro: Libro):
    data = libro.dict()
    response = supabase.table("libros").insert(data).execute()

    if response.data:
        return {"mensaje": "Libro agregado correctamente", "libro": response.data[0]}
    return JSONResponse(
        status_code=400, content={"detail": "Error al insertar el libro"}
    )


# ===== Módulo de clientes =====


# --- Página principal ---
@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})


# --- Inicio/Catálogo de libros ---
@app.get("/catalogo", response_class=HTMLResponse)
async def catalogo_page(request: Request):  # ← tipo correcto aquí
    return templates.TemplateResponse("catalogo.html", {"request": request})


@app.get("/api/catalogo")
def obtener_catalogo():
    data = supabase.table("libros").select("*").execute()
    return data.data


# --- Detalles del libro ---
@app.get("/libro/{id}", response_class=HTMLResponse)
async def get_libro(request, id: int):
    return templates.TemplateResponse(
        "libro.html", {"request": request, "libro_id": id}
    )


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
@app.get("/admin/dashboard", response_class=HTMLResponse)
async def home(request: Request):
    session = request.cookies.get("admin_session")
    if not session:
        return RedirectResponse("/admin/login")

    return templates.TemplateResponse("admin/dashboard.html", {"request": request})


# --- Login de administradores ---
@app.get("/admin", response_class=HTMLResponse)
async def admin_login(request: Request):
    return templates.TemplateResponse("admin/login.html", {"request": request})


# =======================
# Interfaces de Servicios
# =======================


# --- Registro de administradores ---
@app.post("/admins/register")
def registrar_usuario(usuario: UsuarioRegistro):
    try:
        existente = (
            supabase.table("admins").select("*").eq("email", usuario.email).execute()
        )
        if existente.data:
            raise HTTPException(status_code=400, detail="El admin ya existe")

        hashed = bcrypt.hash(usuario.password)

        nuevo = {
            "username": usuario.username,
            "email": usuario.email,
            "hashed_password": hashed,
        }

        res = supabase.table("admins").insert(nuevo).execute()
        print(res)
        return {"mensaje": "Admin registrado correctamente", "debug": res}
    except Exception as e:
        print("❌ Error:", e)
        raise HTTPException(status_code=500, detail=str(e))


# --- Login de administradores ---
@app.post("/admins/login")
def login_usuario(usuario: UsuarioLogin):
    res = supabase.table("admins").select("*").eq("email", usuario.email).execute()

    if not res.data:
        raise HTTPException(status_code=404, detail="Admin no encontrado")

    usuario_db = res.data[0]

    if not bcrypt.verify(usuario.password, usuario_db["hashed_password"]):
        raise HTTPException(status_code=401, detail="Contraseña incorrecta")

    # Guardamos sesión en cookie
    response = RedirectResponse(url="/admin/dashboard", status_code=303)
    response.set_cookie(key="admin_session", value=usuario_db["id"], httponly=True)
    return response


# --- Registro ---
@app.post("/usuarios/register")
def registrar_usuario(usuario: UsuarioRegistro):
    try:
        existente = (
            supabase.table("usuarios").select("*").eq("email", usuario.email).execute()
        )
        if existente.data:
            raise HTTPException(status_code=400, detail="El usuario ya existe")

        hashed = bcrypt.hash(usuario.password)

        nuevo = {
            "username": usuario.username,
            "email": usuario.email,
            "hashed_password": hashed,
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

    response = {"mensaje": f"Bienvenido {usuario_db['username']}"}
    return response


# --- Gestión de Libros ---
@app.get("/libros")
def listar_libros():
    response = supabase.table("libros").select("*").execute()
    return response.data


@app.get("/libros/{id}")
def obtener_libro(id: int):
    response = supabase.table("libros").select("*").eq("id", id).execute()
    if not response.data:
        return {"error": "Libro no encontrado"}
    return response.data[0]


@app.post("/libros")
def agregar_libro(libro: Libro):
    response = supabase.table("libros").insert(libro.dict()).execute()
    return response.data


@app.put("/libros/{id}")
def editarLibro(id: int, libro: Libro):
    response = supabase.table("libros").update(libro.dict()).eq("id", id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Libro no encontrado")
    return response.data


@app.delete("/libros/{id}")
def eliminarLibro(id: int):
    response = supabase.table("libros").delete().eq("id", id).execute()
    return {"deleted": len(response.data)}


# =========================
# Gestión de Usuarios (Admin)
# =========================


@app.get("/admin/usuarios")
def listar_usuarios():
    res = (
        supabase.table("usuarios").select("*").order("created_at", desc=True).execute()
    )
    return res.data


@app.post("/admin/usuarios/create")
async def crear_usuario(
    request: Request,
    name: str = Form(...),
    email: str = Form(...),
    password: str = Form(...),
    role: str = Form(...),
):
    # Verificar si el usuario ya existe
    existente = supabase.table("usuarios").select("*").eq("email", email).execute()
    if existente.data:
        raise HTTPException(status_code=400, detail="El usuario ya existe")

    hashed = bcrypt.hash(password)

    nuevo = {
        "username": name,
        "email": email,
        "hashed_password": hashed,
        "rol": role,  # 👈 Asegúrate que este campo exista en tu BD
    }

    res = supabase.table("usuarios").insert(nuevo).execute()

    return {"mensaje": "Usuario creado correctamente"}


@app.delete("/admin/usuarios/{user_id}")
def eliminar_usuario(user_id: int):
    res = supabase.table("usuarios").delete().eq("id", user_id).execute()

    if not res.data:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    return {"message": "Usuario eliminado"}
