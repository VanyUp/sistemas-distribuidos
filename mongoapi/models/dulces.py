from pydantic import BaseModel, Field, constr, conint
from typing import Optional

class Dulces(BaseModel):
    nombre: constr(strip_whitespace=True, min_length=2, max_length=50) = Field(
        ..., description="Nombre comercial del dulce"
    )
    tipo: constr(strip_whitespace=True, min_length=2, max_length=50) = Field(
        ..., description="Tipo de dulce (Chocolate, Gomita, Caramelo, etc.)"
    )
    sabor: constr(strip_whitespace=True, min_length=3, max_length=50) = Field(
        ..., description="Sabor principal (Fresa, Menta, Cacao, etc.)"
    )
    precio: conint(ge=0, le=1_000_000) = Field(
        ..., description="Precio en COP (0 a 1'000.000)"
    )
    origen: constr(strip_whitespace=True, min_length=2, max_length=50) = Field(
        ..., description="País o región de origen"
    )
    disponible: constr(strip_whitespace=True, min_length=2, max_length=50) = Field(
        ..., description="País o región de origen"
    )
    stock: conint(ge=0, le=1_000_000) = Field(
        ..., description="Unidades disponibles (>= 0)"
    )
