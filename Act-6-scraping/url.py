##pip install requests beautifulsoup4 pandas openpyxl


import requests #peticion pagina html, postback 
from bs4 import BeautifulSoup
import pandas as pd #manipulacion datos, excel

# URL objetivo
url = "https://quotes.toscrape.com/"  # Página de prueba para scraping

# Obtener contenido HTML
response = requests.get(url)
soup = BeautifulSoup(response.text, "html.parser")


# Extraer datos: frases y autores
quotes = []
authors = []

for quote_block in soup.find_all("div", class_="quote"):
    text = quote_block.find("span", class_="text").text
    author = quote_block.find("small", class_="author").text
    quotes.append(text)
    authors.append(author)

# Crear DataFrame
df = pd.DataFrame({
    "Quote": quotes,
    "Author": authors
})

# Guardar en Excel
df.to_excel("resultados.xlsx", index=False)

print("✅ Datos exportados a resultados.xlsx")