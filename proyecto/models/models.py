from pydantic import BaseModel, EmailStr, Field, constr

class UserRegister(BaseModel):
    username: str = Field(..., min_length=3, max_length=20)
    email: EmailStr
    password: constr(min_length=8, max_length=200)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

# Mensaje de la IA
class Message(BaseModel):
    text: str
    token: str