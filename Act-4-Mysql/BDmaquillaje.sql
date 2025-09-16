

-- Crear la tabla ProductosMaquillaje
CREATE TABLE IF NOT EXISTS ProductosMaquillaje (
    id INT NOT NULL,                 -- Identificador único (Primary Key)
    Marca VARCHAR(100) NOT NULL,     -- Nombre de la marca
    Categoria VARCHAR(100) NOT NULL, -- Tipo de producto (labial, base, sombra, etc.)
    Producto VARCHAR(150) NOT NULL,  -- Nombre específico del producto
    TipoPiel VARCHAR(50),            -- Tipo de piel recomendado (puede ser NULL)
    Cantidad INT NOT NULL,           -- Stock disponible
    PRIMARY KEY (id)                 -- Clave primaria
);


