from fastapi import FastAPI, Request, Form
from fastapi.responses import HTMLResponse, RedirectResponse, JSONResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from models.models import Libro, UsuarioLogin, UsuarioRegistro
from fastapi import HTTPException
from passlib.hash import bcrypt
from supabase import create_client
from dotenv import load_dotenv
from datetime import datetime
import random
import httpx
import time
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


# --- Detalles del libro ---
@app.get("/libro/{id}", response_class=HTMLResponse)
async def get_libro(request, id: int):
    return templates.TemplateResponse(
        "libro.html", {"request": request, "libro_id": id}
    )


# --- Carrito de compras ---
@app.get("/carrito", response_class=HTMLResponse)
async def get_carrito(request: Request):
    return templates.TemplateResponse("carrito.html", {"request": request})


# --- Pago y confirmación ---
@app.get("/pago", response_class=HTMLResponse)
async def get_pago(request: Request):
    return templates.TemplateResponse("pago.html", {"request": request})


# --- Historial de pedidos ---
@app.get("/historial", response_class=HTMLResponse)
async def get_historial(request: Request):
    return templates.TemplateResponse("historial.html", {"request": request})


# --- Perfil de usuario ---
@app.get("/perfil", response_class=HTMLResponse)
async def get_perfil(request: Request):
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


@app.post("/perfil/guardar")
async def guardar_perfil(
    usuario_id: int = Form(...),
    nombre: str = Form(...),
    apellido: str = Form(...),
    telefono: str = Form(None),
    fecha_nacimiento: str = Form(None),
    genero: str = Form(None),
):
    try:
        existente = (
            supabase.table("clientes")
            .select("*")
            .eq("usuario_id", usuario_id)
            .execute()
        )

        datos = {
            "usuario_id": usuario_id,
            "nombre": nombre,
            "apellido": apellido,
            "telefono": telefono,
            "fecha_nacimiento": fecha_nacimiento,
            "genero": genero,
        }

        if existente.data:
            cliente_id = existente.data[0]["id"]
            supabase.table("clientes").update(datos).eq("id", cliente_id).execute()
        else:
            supabase.table("clientes").insert(datos).execute()

        return {"mensaje": "✅ Datos guardados correctamente"}

    except Exception as e:
        print("❌ Error guardando perfil:", e)
        raise HTTPException(status_code=500, detail="No se pudo guardar la información")


@app.get("/perfil/datos")
async def obtener_perfil(usuario_id: int):
    try:
        # Obtener datos del usuario
        usuario = (
            supabase.table("usuarios")
            .select("*")
            .eq("id", usuario_id)
            .single()
            .execute()
        )

        # Obtener datos adicionales del cliente (si existen)
        cliente = (
            supabase.table("clientes")
            .select("*")
            .eq("usuario_id", usuario_id)
            .single()
            .execute()
        )

        return {
            "email": usuario.data.get("email"),
            "nombre": cliente.data.get("nombre") if cliente.data else "",
            "apellido": cliente.data.get("apellido") if cliente.data else "",
            "telefono": cliente.data.get("telefono") if cliente.data else "",
            "fecha_nacimiento": (
                cliente.data.get("fecha_nacimiento") if cliente.data else ""
            ),
            "genero": cliente.data.get("genero") if cliente.data else "",
            "created_at": usuario.data.get("created_at"),
        }

    except Exception as e:
        print("❌ Error obteniendo perfil:", e)
        raise HTTPException(status_code=500, detail="No se pudo obtener el perfil")


@app.get("/api/catalogo")
def obtener_catalogo():
    data = supabase.table("libros").select("*").execute()
    return data.data


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


# --- Login ---
@app.post("/usuarios/login")
def login_usuario(usuario: UsuarioLogin):
    res = supabase.table("usuarios").select("*").eq("email", usuario.email).execute()

    if not res.data:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    usuario_db = res.data[0]

    if not bcrypt.verify(usuario.password, usuario_db["hashed_password"]):
        raise HTTPException(status_code=401, detail="Contraseña incorrecta")

    # ✅ devolvemos id y username
    return {
        "mensaje": f"Bienvenido {usuario_db['username']}",
        "user_id": usuario_db["id"],
        "username": usuario_db["username"],
    }


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


# =========================
# Carrito de compras (por usuario)
# =========================


# agregar item al carrito
@app.post("/carrito/agregar")
def agregar_al_carrito(item: dict):
    user_id = item.get("user_id")
    libro_id = item.get("libro_id")
    cantidad = item.get("cantidad", 1)

    # 1️⃣ Buscar si el usuario ya tiene un carrito
    carrito_res = supabase.table("carrito").select("*").eq("user_id", user_id).execute()
    if carrito_res.data:
        carrito_id = carrito_res.data[0]["id"]
    else:
        # Si no existe, se crea uno nuevo
        nuevo = supabase.table("carrito").insert({"user_id": user_id}).execute()
        carrito_id = nuevo.data[0]["id"]

    # 2️⃣ Verificar si el libro ya está en carrito_items
    existente = (
        supabase.table("carrito_items")
        .select("*")
        .eq("carrito_id", carrito_id)
        .eq("libro_id", libro_id)
        .execute()
    )

    if existente.data:
        # 3️⃣ Si ya está, actualizar cantidad
        item_id = existente.data[0]["id"]
        nueva_cantidad = existente.data[0]["cantidad"] + cantidad
        supabase.table("carrito_items").update({"cantidad": nueva_cantidad}).eq(
            "id", item_id
        ).execute()
    else:
        # 4️⃣ Insertar nuevo libro al carrito
        # Puedes traer el precio desde libros o pasarlo desde el front
        libro_data = (
            supabase.table("libros").select("precio").eq("id", libro_id).execute()
        )
        precio_unitario = libro_data.data[0]["precio"] if libro_data.data else 0

        supabase.table("carrito_items").insert(
            {
                "carrito_id": carrito_id,
                "libro_id": libro_id,
                "cantidad": cantidad,
                "precio_unitario": precio_unitario,
            }
        ).execute()

    return {"message": "Producto agregado correctamente"}


# obtener items del carrito por user_id
@app.get("/carrito/{user_id}")
def obtener_carrito(user_id: int):
    try:
        # 1️⃣ Buscar el carrito del usuario
        carrito = (
            supabase.table("carrito")
            .select("id")
            .eq("user_id", user_id)
            .single()
            .execute()
        )

        if not carrito.data:
            return []

        carrito_id = carrito.data["id"]

        # 2️⃣ Traer los items del carrito
        items = (
            supabase.table("carrito_items")
            .select("id, cantidad, precio_unitario, libro_id")
            .eq("carrito_id", carrito_id)
            .execute()
        )

        if not items.data:
            return []

        libros_ids = [i["libro_id"] for i in items.data]
        libros_data = (
            supabase.table("libros")
            .select("id, nombre, precio, portada, autor")
            .in_("id", libros_ids)
            .execute()
        )

        libros_map = {l["id"]: l for l in libros_data.data}

        for i in items.data:
            libro = libros_map.get(i["libro_id"], {})
            i["libros"] = {
                "titulo": libro.get("nombre", ""),
                "precio": libro.get("precio", 0),
                "portada": libro.get("portada", ""),
                "autor": libro.get("autor", ""),
            }

        return items.data

    except httpx.RemoteProtocolError:
        time.sleep(1)
        return obtener_carrito(user_id)
    except Exception as e:
        print("Error en obtener_carrito:", e)
        raise HTTPException(status_code=500, detail=str(e))


# eliminar item del carrito
@app.delete("/carrito/{item_id}")
def eliminar_item_carrito(item_id: int):
    res = supabase.table("carrito_items").delete().eq("id", item_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Item no encontrado")
    return {"mensaje": "Libro eliminado del carrito"}


# crear pedido desde el carrito
@app.post("/pedidos/crear")
def crear_pedido_detallado(data: dict):
    user_id = data.get("user_id")
    direccion = data.get("direccion")
    envio = data.get("envio")
    pago_info = data.get("pago")
    nota = data.get("nota", "")

    if not user_id:
        raise HTTPException(status_code=400, detail="Falta el ID del usuario")

    # 1️⃣ Obtener carrito del usuario
    carrito = (
        supabase.table("carrito").select("id").eq("user_id", user_id).single().execute()
    )
    if not carrito.data:
        raise HTTPException(status_code=400, detail="El usuario no tiene carrito")

    carrito_id = carrito.data["id"]

    # 2️⃣ Obtener items del carrito
    carrito_items = (
        supabase.table("carrito_items")
        .select("*")
        .eq("carrito_id", carrito_id)
        .execute()
    )
    if not carrito_items.data:
        raise HTTPException(status_code=400, detail="El carrito está vacío")

    codigo_pedido = f"VS-{datetime.now().year}-{random.randint(1000,9999)}"

    # 3️⃣ Insertar pedido
    pedido_data = {
        "user_id": data["user_id"],
        "total": data["total"],
        "codigo_pedido": codigo_pedido,
        "estado": "pending",
    }
    pedido_res = supabase.table("pedidos").insert(pedido_data).execute()
    pedido_id = pedido_res.data[0]["id"]

    # 4️⃣ Insertar items
    for item in carrito_items.data:
        supabase.table("pedido_items").insert(
            {
                "pedido_id": pedido_id,
                "libro_id": item["libro_id"],
                "cantidad": item["cantidad"],
                "precio_unitario": item["precio_unitario"],
            }
        ).execute()

    # 5️⃣ Guardar dirección
    if direccion:
        direccion_data = direccion.copy()
        direccion_data["pedido_id"] = pedido_id
        supabase.table("direcciones_envio").insert(direccion_data).execute()

    # 6️⃣ Guardar método de pago
    if pago_info:
        pago_data = pago_info.copy()
        pago_data["pedido_id"] = pedido_id
        supabase.table("pagos").insert(pago_data).execute()

    # 7️⃣ Guardar info de envío (opcional)
    if envio:
        envio_data = envio.copy()
        envio_data["pedido_id"] = pedido_id
        supabase.table("envios").insert(envio_data).execute()

    # 8️⃣ Vaciar carrito
    supabase.table("carrito_items").delete().eq("carrito_id", carrito_id).execute()

    return {"mensaje": "Pedido creado correctamente", "pedido_id": pedido_id, "codigo_pedido": codigo_pedido}
