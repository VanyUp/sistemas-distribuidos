from fastapi import FastAPI, HTTPException, Form
from pydantic import BaseModel
from fastapi.responses import JSONResponse
from openai import OpenAI
from fastapi.middleware.cors import CORSMiddleware
import os
import re
import spacy

app = FastAPI(title="Chat Terapéutico")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],      # o ["http://127.0.0.1:5500"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Usa variable de entorno: OPENROUTER_API_KEY
client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key="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"
)

# Prompt base del sistema
SYSTEM_PROMPT = (
    "Eres un asistente de apoyo psicológico no clínico en español. "
    "Objetivo: contener, clarificar y proponer micro-acciones concretas. "
    "No diagnostiques ni prometas curas. No reemplazas terapia profesional. "
    "Responde en 3 pasos: 1) Validación breve. 2) Opciones prácticas. 3) Paso siguiente sencillo. "
    "Si detectas riesgo (autolesión, suicidio, violencia), responde con mensaje de seguridad y "
    "deriva a líneas de ayuda en Colombia (106, 123, 911)."
)

# Expresiones de crisis
CRISIS_PATTERNS = re.compile(
    r"(suicid|quitarme la vida|me quiero morir|autolesi|matarme|violencia|abuso)",
    re.IGNORECASE
)

class Chat(BaseModel):
    mensaje: str

@app.get("/")
async def root():
    return {"mensaje": "Chat Terapéutico!"}

@app.post("/chat")
async def chat(req: Chat):
    if not client.api_key:
        raise HTTPException(500, "Configura la variable de entorno OPENROUTER_API_KEY.")
    
    texto = req.mensaje.strip()
    if not texto:
        raise HTTPException(400, "El mensaje no puede estar vacío.")
    
    # Detectar crisis
    if CRISIS_PATTERNS.search(texto):
        return JSONResponse(content={
            "reply": (
                "Parece que estás pasando por un momento difícil. "
                "Si estás en Colombia, puedes llamar a las líneas de ayuda 106, 123 o 911 para recibir apoyo inmediato. "
                "Recuerda que no estás solo y hay personas dispuestas a ayudarte."
            ),
            "criisis": True
        })
    
    try:
        r = client.chat.completions.create(
            model="openai/gpt-oss-20b:free",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": texto},
            ],
            temperature=0.3, # Respuesta más coherente y menos creativa
        )
        respuesta = r.choices[0].message.content.strip()
        return JSONResponse(content={
            "reply": respuesta,
            "criisis": False
        })
        
    except Exception as e:
        raise HTTPException(502, f"Error consultando el modelo: {e}") 
    
"""
@app.post("/analizar-sentimiento")
async def analizar_sentimiento(mensaje: str = Form(...)):
    try:
        respuesta = client.chat.completions.create(
            extra_headers={
                "HTTP-Referer": "",
                "X-Title": "",
            },
            model="gpt-oss-20b:free",
            messages=[
                {"role": "system", "content": "Eres un experto en análisis de sentimientos. Analiza el siguiente mensaje y responde únicamente con una de estas etiquetas: positivo, negativo o neutro."},
                {"role": "user", "content": f"Analiza el sentimiento del siguiente mensaje: '{mensaje}'"}
            ]
        )
        sentimiento = respuesta.choices[0].message.content.strip().lower()
        if sentimiento not in ["positivo", "negativo", "neutro"]:
            sentimiento = "neutro"
        return JSONResponse(content={
            "mensaje": mensaje,
            "sentimiento": sentimiento
        })
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)


#pip install spacy
#python -m spacy download es_core_news_sm
@app.post("/entidades")
async def analizar_entidades(mensaje: str = Form(...)):
    nlp = spacy.load('es_core_news_sm')
    try:
        doc = nlp(mensaje)
        entidades = [
            {"texto": ent.text, "tipo": ent.label_}
            for ent in doc.ents
        ]
        return JSONResponse(content={
            "mensaje": mensaje,
            "entidades": entidades
        })
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)"""