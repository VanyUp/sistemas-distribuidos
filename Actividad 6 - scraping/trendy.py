import requests  # peticion pagina html, postback
from bs4 import BeautifulSoup
import pandas as pd  # manipulacion datos, excel

# URL objetivo
url = "https://www.maquillajetrendyshop.com/cuidado-de-la-piel"  # Página de prueba para scraping, especificado por categoria


# Obtener contenido HTML
#response = requests.get(url)

#soup = BeautifulSoup(response.text, "html.parser")


try:
    # Obtener contenido HTML
    response = requests.get(url, timeout=10)
    response.raise_for_status()  # Lanza error si el código HTTP no es 200
except requests.exceptions.RequestException as e:
    print(f"❌ Error al hacer la petición: {e}")


try:
    soup = BeautifulSoup(response.text, "html.parser")
except Exception as e:
    print(f"❌ Error al procesar el HTML: {e}")



# Extraer datos: frases y autores

limgs = []
nproducts = []
valores = []
links = []

for quote_block in soup.find_all(
    "div", class_="vtex-slider-layout-0-x-sliderTrack"):  # trae todo el contenido de la clase (contenedor)

    #limg = quote_block.find("div", class_="vtex-product-summary-2-x-imageContainer")["src"].strip()
    # Extraer el enlace de la imagen correctamente
    img_tag = quote_block.find("img", class_="vtex-product-summary-2-x-imageNormal")
    limg = img_tag["src"].strip() if img_tag and img_tag.has_attr("src") else "N/A"
    nproduct = quote_block.find("span", class_="vtex-product-summary-2-x-productBrand")
    valor = quote_block.find("span", class_="vtex-product-price-1-x-sellingPrice")
    link_tag = quote_block.find("a", class_="vtex-product-summary-2-x-clearLink")
    link = link_tag["href"].strip() if link_tag and link_tag.has_attr("href") else "N/A"
    
    limgs.append(limg)
    nproducts.append(nproduct)
    valores.append(valor)
    links.append(link)


# Crear DataFrame
df = pd.DataFrame({
        "Link Imagen": limgs, 
        "Nombre Del Producto": nproducts,
        "Valor Del Producto": valores,
        "Vista Producto": links
     })

# Guardar en Excel
df.to_excel("Trendy.xlsx", index=False)

print("✅ Datos exportados a resultados.xlsx")
