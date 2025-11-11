from pydantic import BaseModel, EmailStr, Field

class UsuarioLogin(BaseModel):
    email: EmailStr
    password: str

class UsuarioRegistro(BaseModel):
    username: str = Field(..., min_length=3, max_length=20)
    email: EmailStr
    password: str = Field(..., min_length=6)


class Message(BaseModel):
    text: str

class Libro(BaseModel):
    nombre: str
    autor: str
    portada: str
    cantidad_hojas: int
    stock: int
    precio: float

class Cliente(BaseModel):
    usuario_id: int
    nombre: str
    apellido: str
    telefono: str | None = None
    fecha_nacimiento: str | None = None
    genero: str | None = None