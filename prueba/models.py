from pydantic import BaseModel

class Libro(BaseModel):
    nombre: str
    autor: str
    cantidad_hojas: int
    stock: int
    precio: float


