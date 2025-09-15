from bs4 import BeautifulSoup

html = """
<div class="quote">
    <span class="text">“Sé tú el cambio que deseas ver en el mundo.”</span> #busca por etiquetas
    <small class="author">Mahatma Gandhi</small> #traigo frase y autor 
</div>
"""

soup = BeautifulSoup(html, "html.parser") #entender como html, xml formato estructurado
quote_text = soup.find("span", class_="text").text 
author = soup.find("small", class_="author").text

print("Frase:", quote_text)
print("Autor:", author)
