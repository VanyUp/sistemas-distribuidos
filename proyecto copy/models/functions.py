from jose import JWTError, jwt
from datetime import datetime, timedelta
from passlib.context import CryptContext
from dotenv import load_dotenv
from bs4 import BeautifulSoup
import requests
import pandas as pd
import os

load_dotenv()

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)



# =====================
# Scraping (Ejecutar automaticamente cada 10 minutos)

#buscar libreria y cambiar referencias del html
# =====================
async def scrap_tarot(newstarot_collection):
    url = "https://tn.com.ar/tags/tarot/"
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, "html.parser")
    except Exception as e:
        print(f"❌ Error en scraping tarot: {e}")
        return

    for quote_block in soup.find_all("article", class_="card__horizontal"):
        try:
            title = quote_block.find("h2", class_="card__headline")
            description = quote_block.find("p", class_="card__subheadline")
            img_tag = quote_block.find("div", class_="aspect_ratio__container").find("img")
            label = quote_block.find("a", class_="author__name")

            noticia = {
                "titulo": title.text.strip() if title else "N/A",
                "descripcion": description.text.strip() if description else "N/A",
                "imagen_url": img_tag["src"].strip() if img_tag else "N/A",
                "autor": label.text.strip() if label else "N/A"
            }

            existing = await newstarot_collection.find_one({"titulo": noticia["titulo"]})
            if not existing:
                await newstarot_collection.insert_one(noticia)
                print(f"✅ Noticia insertada: {noticia['titulo']}")
            else:
                print(f"ℹ️ Noticia ya existe: {noticia['titulo']}")

        except Exception as e:
            print(f"⚠️ Error procesando noticia: {e}")
            continue



