import requests  # peticion pagina html, postback
from bs4 import BeautifulSoup
import pandas as pd  # manipulacion datos, excel

# URL objetivo
url = "https://www.inducascos.com/cascos/integrales"  # Página de prueba para scraping, especificado por categoria

#Obtener contenido HTML
response = requests.get(url)
soup = BeautifulSoup(response.text, "html.parser")


# Extraer datos: frases y autores

#limgs = []
nproducts = []
valores = []
#links = []

for quote_block in soup.find_all(
    "section", class_="vtex-product-summary-2-x-container"):  # trae todo el contenido de la clase (contenedor)

    #limg = quote_block.find("div", class_="vtex-product-summary-2-x-imageContainer")["src"].strip()
    # Extraer el enlace de la imagen correctamente
 
    nproduct = quote_block.find("div", class_="vtex-product-summary-2-x-nameContainer").text.strip()
    valor = quote_block.find("span", class_="vtex-product-price-1-x-sellingPrice").text.strip()
   
   # link_tag = quote_block.find("a", class_="vtex-product-summary-2-x-clearLink")

    
    #limgs.append(limg)
    nproducts.append(nproduct)
    valores.append(valor)
    #links.append(link)


# Crear DataFrame
df = pd.DataFrame({
        #"Link Imagen": limgs, 
        "Nombre Del Producto": nproducts,
        "Valor Del Producto": valores
        #"Vista Producto": links
     })

# Guardar en Excel
df.to_excel("Shein.xlsx", index=False)

print("✅ Datos exportados a resultados.xlsx")
