from fastapi import (
    FastAPI,
    Depends,
    HTTPException,
    status,
)  # Depends para manejar dependencias, HTTPException para manejar errores
from fastapi.security import (
    OAuth2PasswordBearer,
    OAuth2PasswordRequestForm,
)  # para manejar la autenticacion
from passlib.context import CryptContext
from jose import (
    JWTError,
    jwt,
)  # libreria para trabajar con JWT (Json Web Tokens) cadenas encriptadas
from datetime import datetime, timedelta  # permiten trabajar con fechas y tiempos

app = FastAPI(title="jwt")

# Clave secreta para firmar los tokens (mantener segura)
SECRET_KEY = "5A33CE0D096E3F191BBD8BE0A02F0AACA761C57D5F8AF4B86F070DD35D134616"  # SISDIS
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 2

# Simulación de base de datos de usuarios
fake_users_db = {
    "vadmin": {
        "username": "vadmin",
        "full_name": "Administrador",
        "email": "admin@example.com",
        "password": "vadmin123",
        "hashed_password": "$2b$12$QyA5mTxWVOeFqMfE5peQ.e5ENXZODjHjElrDBNwKcZn8y3lq5JwX2",  # Contraseña: "admin123"
    }
}


# Sistema de autenticación con OAuth2
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")



# Función para verificar contraseñas, validar si el user del servicio es el que esta en la BD
def verify_password(plain_password, hashed_password):
    print(plain_password, hashed_password)
    if(plain_password == hashed_password):
        return True
    return False

# Función para obtener un usuario de la "base de datos" 
def get_user(username: str):
    user = fake_users_db.get(username)
    if user:
        return user
    return None

# Función para generar el token JWT
def create_access_token(data: dict, expires_delta: timedelta):
    to_encode = data.copy()
    expire = datetime.utcnow() + expires_delta
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


# Endpoint para generar token (Login)
@app.post("/token")
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    user = get_user(form_data.username)
    if not user or not verify_password(form_data.password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales incorrectas",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(data={"sub": user["username"]}, expires_delta=access_token_expires)

    return {"access_token": access_token, "token_type": "bearer"}


# Endpoint protegido con JWT
@app.get("/users/me")
async def read_users_me(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token inválido")
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token inválido")

    user = get_user(username)
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Usuario no encontrado")

    return {"username": user["username"], "full_name": user["full_name"] ,"email": user["email"]}




@app.get("/")
async def inicio():
    return {"mensaje": "Hola Mundo JWT!"}
