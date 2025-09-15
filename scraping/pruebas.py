import requests  # peticion pagina html, postback
from bs4 import BeautifulSoup
import pandas as pd  # manipulacion datos, excel

# URL objetivo
url = "https://www.nihonfigures.com/c880420_figuras-articuladas.html"  # Página de prueba para scraping, especificado por categoria

# Obtener contenido HTML
response = requests.get(url)
soup = BeautifulSoup(response.text, "html.parser")


# Extraer datos

limgs = []
nproducts = []
valores_descuento = []
valores_reales = []
disponiblidad = []
descripciones = []


for quote_block in soup.find_all("div", class_="wrapper-product"):  # trae todo el contenido de la clase (contenedor)

    # Extraer el enlace de la imagen
    limg = quote_block.find("div", class_="product-img").find("img")["src"].strip()

    # Extraer el nombre del producto
    nproduct = quote_block.find("header", class_="product-title").text.strip()

    # Extraer el valor con descuento, si existe 
    precio_final_tag = quote_block.find("span", class_="precio-oferta")
    if precio_final_tag:
        valor_condescuento = precio_final_tag.text.strip()
    else:
        valor_condescuento = "Sin Descuento"

    #guarda el valor real del producto sin descuento/ pero tienen el mismo div o.o 
    valor_real_SD = quote_block.find("span", class_="precio-final")
    
    #trae el valor real del producto sin descuento 
    valor_real = quote_block.find("span", class_="strike")
    #si no hay valor real con descuento, toma el valor real sin descuento
    valor_real = valor_real.get_text().strip() if valor_real else valor_real_SD.get_text().strip()
    # Extraer el estado de disponibilidad
    disponible = quote_block.find("div", class_="tag-stock").text.strip()

    #traemos la info de la figura, if para crear la lista de caracteristicas
    descripcion = quote_block.find("div", class_="col-md-12")
    if descripcion:
        carcteristicas = descripcion.find_all("li")
        descripcion = "\n".join([li.get_text(strip=True) for li in carcteristicas])
    else:
        descripcion = "No hay descripcion"



    limgs.append(limg)
    nproducts.append(nproduct)
    valores_descuento.append(valor_condescuento)
    valores_reales.append(valor_real)
    disponiblidad.append(disponible)
    descripciones.append(descripcion)



# Crear DataFrame
df = pd.DataFrame(
    {
        "Link Imagen": limgs,
        "Nombre Del Producto": nproducts,
        "Valor Real": valores_reales,
        "Valor Con Descuento": valores_descuento,
        "Estado Disponibilidad": disponiblidad,
        "Descripcion": descripciones,
        
    }
)

# Guardar en Excel
df.to_excel("Figuras_Anime.xlsx", index=False)

print("✅ Datos exportados a Figuras Anime.xlsx")
