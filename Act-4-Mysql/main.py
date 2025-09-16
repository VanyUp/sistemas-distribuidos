from fastapi import FastAPI, HTTPException, Form
import mysql.connector

app = FastAPI(title="[SISDIS] FastAPI Project")

# ========= Conexión a MySQL (Railway, red pública) =========
def conexion_mysql():
    """
    Abre una conexión a MySQL usando el host/puerto PÚBLICOS de Railway.
    """
    try:
        conn = mysql.connector.connect(
            host="mainline.proxy.rlwy.net",   # host público
            port=31744,                       # puerto público asignado por Railway
            user="root",
            password="zaZMbdoMWVWCgXmKnYjEmAqtjccqcRUd",
            database="railway",
            connection_timeout=8          # timeout razonable
        )
        return conn
    except mysql.connector.Error as e:
        print(f"[DB ERROR] {e.errno} {e.sqlstate}: {e.msg}")
        raise HTTPException(status_code=500, detail="No se pudo conectar a la base de datos")


# ========= CREATE =========
@app.post("/ProductosMaquillaje")
async def crear_producto(
    id: int = Form(...),             
    Marca: str = Form(...),
    Categoria: str = Form(...),
    Producto: str = Form(...),
    TipoPiel: str = Form(...),
    Cantidad: int = Form(...),
):

    try:
        conn = conexion_mysql()
        cur = conn.cursor()
        cur.execute(
            """
            INSERT INTO ProductosMaquillaje (id, Marca, Categoria, Producto, TipoPiel, Cantidad)
            VALUES (%s, %s, %s, %s, %s, %s)
            """,
            (id, Marca, Categoria, Producto, TipoPiel, Cantidad),
        )
        conn.commit()
        return {"mensaje": f"Producto #{id} insertado correctamente"}
    except mysql.connector.IntegrityError as e:
        # Error típico: PK duplicada
        if e.errno == 1062:
            raise HTTPException(status_code=409, detail=f"Ya existe un producto con id={id}")
        raise HTTPException(status_code=400, detail="No se pudo insertar el producto")
    except Exception as e:
        print("[INSERT ERROR]", e)
        raise HTTPException(status_code=400, detail="Error al insertar el producto")
    finally:
        try:
            cur.close()
            conn.close()
        except:
            pass


# ========= READ (ALL) =========
@app.get("/ProductosMaquillaje")
async def listar_productos():

    try:
        conn = conexion_mysql()
        cur = conn.cursor(dictionary=True)
        cur.execute("SELECT * FROM ProductosMaquillaje")
        rows = cur.fetchall()
        return {"ProductosMaquillaje": rows}
    except Exception as e:
        print("[LIST ERROR]", e)
        raise HTTPException(status_code=500, detail="Error al listar los productos")
    finally:
        try:
            cur.close()
            conn.close()
        except:
            pass


# ========= READ (ONE) =========
@app.get("/ProductosMaquillaje/{producto_id}")
async def obtener_producto(producto_id: int):

    try:
        conn = conexion_mysql()
        cur = conn.cursor(dictionary=True)
        cur.execute("SELECT * FROM ProductosMaquillaje WHERE id = %s", (producto_id,))
        row = cur.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail=f"Producto #{producto_id} no encontrado")
        return {"Producto": row}
    except HTTPException:
        raise
    except Exception as e:
        print("[GET ONE ERROR]", e)
        raise HTTPException(status_code=500, detail="Error al consultar el producto")
    finally:
        try:
            cur.close()
            conn.close()
        except:
            pass


# ========= UPDATE (ID inmutable) =========
@app.put("/ProductosMaquillaje/{producto_id}")
async def actualizar_producto(
    producto_id: int,                 
    Marca: str = Form(...),
    Categoria: str = Form(...),
    Producto: str = Form(...),
    TipoPiel: str = Form(...),
    Cantidad: int = Form(...),
):
   
    try:
        conn = conexion_mysql()
        cur = conn.cursor()
        cur.execute(
            """
            UPDATE ProductosMaquillaje
            SET Marca = %s, Categoria = %s, Producto = %s, TipoPiel = %s, Cantidad = %s
            WHERE id = %s
            """,
            (Marca, Categoria, Producto, TipoPiel, Cantidad, producto_id),
        )
        conn.commit()

        if cur.rowcount == 0:
        
            raise HTTPException(status_code=404, detail=f"Producto #{producto_id} no encontrado")

        return {"mensaje": f"Producto #{producto_id} actualizado correctamente"}
    except HTTPException:
        raise
    except Exception as e:
        print("[UPDATE ERROR]", e)
        raise HTTPException(status_code=500, detail="Error al actualizar el producto")
    finally:
        try:
            cur.close()
            conn.close()
        except:
            pass


# ========= DELETE =========
@app.delete("/ProductosMaquillaje/{producto_id}")
async def eliminar_producto(producto_id: int):

    try:
        conn = conexion_mysql()
        cur = conn.cursor()
        cur.execute("DELETE FROM ProductosMaquillaje WHERE id = %s", (producto_id,))
        conn.commit()

        if cur.rowcount == 0:
            raise HTTPException(status_code=404, detail=f"Producto #{producto_id} no encontrado")

        return {"mensaje": f"Producto #{producto_id} eliminado correctamente"}
    except HTTPException:
        raise
    except Exception as e:
        print("[DELETE ERROR]", e)
        raise HTTPException(status_code=500, detail="Error al eliminar el producto")
    finally:
        try:
            cur.close()
            conn.close()
        except:
            pass
