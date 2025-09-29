from fastapi import FastAPI, HTTPException, Form
from pydantic import BaseModel
from fastapi.responses import JSONResponse
from openai import OpenAI
import os
import spacy

app = FastAPI(title="API Nombres")

# Usa variable de entorno: OPENROUTER_API_KEY
client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key="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"
)

class Nombre(BaseModel):
    nombre: str

@app.get("/")
async def root():
    return {"mensaje": "Hola Mundo!"}

@app.post("/significado")
async def significado(req: Nombre):
    if not client.api_key:
        raise HTTPException(500, "Configura la variable de entorno OPENROUTER_API_KEY.")
    try:
        r = client.chat.completions.create(
            model="openai/gpt-oss-20b:free",
            messages=[
                {"role": "system", "content": "Eres experto en etimología. Responde breve y claro, SOLO EN ESPAÑOL."},
                {"role": "user", "content": f"¿Cuál es el significado del nombre {req.nombre}?"},
            ],
        )
        return {
            "nombre": req.nombre,
            "significado": r.choices[0].message.content.strip()
        }
    except Exception as e:
        raise HTTPException(502, f"Error consultando el modelo: {e}")
    

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
        return JSONResponse(content={"error": str(e)}, status_code=500)