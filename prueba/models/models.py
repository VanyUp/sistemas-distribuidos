from pydantic import BaseModel, EmailStr, Field

class Libro(BaseModel):
    nombre: str
    autor: str
    cantidad_hojas: int
    stock: int
    precio: float


class UsuarioLogin(BaseModel):
    email: EmailStr
    password: str

class UsuarioRegistro(BaseModel):
    username: str = Field(..., min_length=3, max_length=20)
    email: EmailStr
    password: str = Field(..., min_length=6)


class Message(BaseModel):
    text: str
