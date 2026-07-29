"""
Funciones de herramientas para el asistente MascoTico.
Cada función consulta la base de datos real y retorna información relevante.
Todas incluyen type hints y docstrings para que el LLM las interprete correctamente.
"""
from datetime import datetime
from database import get_connection
from decimal import Decimal


# Helper para validar si una mascota (especie) está registrada en la base de datos
def _obtener_especies_registradas(cursor) -> list[str]:
    cursor.execute("SELECT nombre FROM mascotas")
    return [row["nombre"] for row in cursor.fetchall()]


# ─────────────────────────────────────────────
# 1. BUSCAR VETERINARIOS POR TIPO DE MASCOTA
# ─────────────────────────────────────────────

def buscar_veterinarios_por_mascota(tipo_mascota: str) -> list[dict]:
    """
    Busca veterinarios disponibles según el tipo de mascota que atienden.
    Retorna nombre, dirección, calificación y celular del veterinario.

    Args:
        tipo_mascota: Tipo de mascota. Valores válidos en el sistema (ej. 'Perro', 'Gato', 'Roedores', 'Reptiles')
    """
    conn = get_connection()
    try:
        cursor = conn.cursor(dictionary=True)
        
        # Validar si la especie está registrada en la base de datos
        especies = _obtener_especies_registradas(cursor)
        # Búsqueda insensible a mayúsculas/minúsculas para robustez
        especie_encontrada = next((e for e in especies if e.lower() == tipo_mascota.lower()), None)
        
        if not especie_encontrada:
            return [{
                "error_especie": f"La especie '{tipo_mascota}' no está registrada en MascoTico.",
                "mensaje": f"Actualmente no ofrecemos soporte para '{tipo_mascota}'. Las especies que atendemos son: {', '.join(especies)}."
            }]

        query = """
            SELECT v.id, v.nombre, v.direccion, v.calificacion, v.celular, m.nombre as mascota
            FROM veterinarios v
            JOIN mascotas m ON v.mascota = m.id
            WHERE m.nombre = %s
            LIMIT 5
        """
        cursor.execute(query, (especie_encontrada,))
        results = cursor.fetchall()
        if not results:
            return [{"mensaje": f"No se encontraron veterinarios disponibles especializados en {especie_encontrada} en este momento."}]
        return results
    except Exception as e:
        return [{"error": str(e)}]
    finally:
        conn.close()


# ─────────────────────────────────────────────
# 2. CONSULTAR CITAS DE UN VETERINARIO
# ─────────────────────────────────────────────

def consultar_citas_veterinario(id_veterinario: int) -> list[dict]:
    """
    Consulta todas las citas agendadas para un veterinario específico.
    Retorna nombre del cliente, fecha de la cita, razón y tipo de mascota.

    Args:
        id_veterinario: ID numérico del veterinario a consultar
    """
    conn = get_connection()
    try:
        cursor = conn.cursor(dictionary=True)
        # Modificado: Se obtiene el nombre del cliente desde la tabla 'usuarios' usando 'id_usuario'
        query = """
            SELECT c.id, u.nombre as nombre_cliente, c.fecha_cita, c.razon, m.nombre as mascota
            FROM citas c
            JOIN usuarios u ON c.id_usuario = u.id
            JOIN mascotas m ON c.mascota = m.id
            WHERE c.id_veterinario = %s
            ORDER BY c.fecha_cita DESC
            LIMIT 10
        """
        cursor.execute(query, (id_veterinario,))
        results = cursor.fetchall()
        if not results:
            return [{"mensaje": f"No hay citas registradas para el veterinario con ID {id_veterinario}"}]
        return results
    except Exception as e:
        return [{"error": str(e)}]
    finally:
        conn.close()


# ─────────────────────────────────────────────
# 3. BUSCAR PRODUCTOS POR CATEGORIA (TIPO MASCOTA)
# ─────────────────────────────────────────────

def buscar_productos_por_categoria(categoria: str) -> list[dict]:
    """
    Busca productos disponibles en la tienda según el tipo de mascota (especie).
    Retorna nombre, marca, precio y stock disponible.

    Args:
        categoria: Categoría/especie de la mascota. Valores válidos (ej. 'Perro', 'Gato', 'Roedores', 'Reptiles')
    """
    conn = get_connection()
    try:
        cursor = conn.cursor(dictionary=True)
        
        # Validar si la especie está registrada en la base de datos
        especies = _obtener_especies_registradas(cursor)
        especie_encontrada = next((e for e in especies if e.lower() == categoria.lower()), None)
        
        if not especie_encontrada:
            return [{
                "error_especie": f"La especie '{categoria}' no está registrada en MascoTico.",
                "mensaje": f"Actualmente no vendemos productos para '{categoria}'. Las especies que atendemos son: {', '.join(especies)}."
            }]

        query = """
            SELECT p.nombre, p.marca, p.precio, p.stock, p.edad, p.tamaño_mascota,
                   m.nombre as categoria_mascota
            FROM productos p
            JOIN mascotas m ON p.mascota = m.id
            WHERE m.nombre = %s AND p.stock > 0
            LIMIT 8
        """
        cursor.execute(query, (especie_encontrada,))
        results = cursor.fetchall()
        if not results:
            return [{"mensaje": f"No hay productos en inventario disponibles para {especie_encontrada}."}]
        return results
    except Exception as e:
        return [{"error": str(e)}]
    finally:
        conn.close()


# ─────────────────────────────────────────────
# 4. CONSULTAR STOCK DE UN PRODUCTO
# ─────────────────────────────────────────────

def consultar_stock_producto(nombre_producto: str) -> dict:
    """
    Consulta el stock disponible y precio de un producto específico por su nombre.

    Args:
        nombre_producto: Nombre o parte del nombre del producto a buscar
    """
    conn = get_connection()
    try:
        cursor = conn.cursor(dictionary=True)
        query = """
            SELECT nombre, marca, precio, stock, edad, tamaño_mascota
            FROM productos
            WHERE nombre LIKE %s AND stock > 0
            LIMIT 1
        """
        cursor.execute(query, (f"%{nombre_producto}%",))
        result = cursor.fetchone()
        if not result:
            return {"mensaje": f"Producto '{nombre_producto}' no encontrado o sin stock disponible"}
        return result
    except Exception as e:
        return {"error": str(e)}
    finally:
        conn.close()


# ─────────────────────────────────────────────
# 5. BUSCAR BLOGS POR CATEGORIA
# ─────────────────────────────────────────────

def buscar_blogs_por_categoria(categoria: str) -> list[dict]:
    """
    Busca blogs informativos publicados por veterinarios según su categoría temática.
    Retorna título, contenido resumido, fecha y nombre del veterinario autor.

    Args:
        categoria: Categoría temática del blog. Valores válidos:
                   'Salud y Prevención', 'Nutrición y Dieta', 'Comportamiento y Adiestramiento',
                   'Guía de Cuidados de Exóticos'
    """
    conn = get_connection()
    try:
        cursor = conn.cursor(dictionary=True)
        query = """
            SELECT b.titulo, LEFT(b.contenido, 150) as resumen,
                   b.fecha_publicacion, v.nombre as veterinario
            FROM blogs b
            JOIN veterinarios v ON b.id_veterinario = v.id
            JOIN categoria_blogs cb ON b.categoria = cb.id
            WHERE cb.nombre LIKE %s
            ORDER BY b.fecha_publicacion DESC
            LIMIT 5
        """
        cursor.execute(query, (f"%{categoria}%",))
        results = cursor.fetchall()
        if not results:
            return [{"mensaje": f"No se encontraron blogs para la categoría temática '{categoria}'"}]
        return results
    except Exception as e:
        return [{"error": str(e)}]
    finally:
        conn.close()


# ─────────────────────────────────────────────
# 6. AGENDAR CITA
# ─────────────────────────────────────────────

def agendar_cita(id_usuario: int, fecha_cita: str = None, razon: str = "Consulta general", tipo_mascota: str = None, id_veterinario: int | None = None, hora: str = "09:00", **extra) -> dict:
    """Agendar una cita en el sistema.
    - Accepts both `fecha_cita` and `fecha`.
    - If `razon` omitted, usa valor por defecto.
    - Si `tipo_mascota` falta, intenta obtenerlo de `extra` o devuelve error.
    - Ignora claves desconocidas.
    """
    # Compatibilidad de nombres
    if fecha_cita is None:
        fecha_cita = extra.get("fecha")
    if tipo_mascota is None:
        tipo_mascota = extra.get("especie")
    # Validaciones básicas
    if not fecha_cita:
        return {"error": "Falta la fecha de la cita (fecha_cita)."}
    if not tipo_mascota:
        return {"error": "Falta tipo_mascota para la cita."}
    # 1. Mapeado de mascota
    mapa_mascotas = {"Perro": 1, "Gato": 2, "Roedores": 3, "Reptiles": 4}
    mascota_id = mapa_mascotas.get(tipo_mascota)
    if not mascota_id:
        return {"error": f"La especie '{tipo_mascota}' no es válida. Usa: Perro, Gato, Roedores, Reptiles."}
    # 2. Validación de fecha
    try:
        fecha_dt = datetime.strptime(fecha_cita, "%Y-%m-%d")
        if fecha_dt.date() < datetime.now().date():
            return {"error": f"La fecha {fecha_cita} ya pasó. Por favor selecciona una fecha futura."}
    except ValueError:
        return {"error": "Formato de fecha inválido. Usa YYYY-MM-DD."}
    if id_veterinario is None or str(id_veterinario).lower() == "none":
        return {"error": "No se ha seleccionado un veterinario válido. Por favor, especifica con qué especialista deseas la cita."}
    # 3. Conexión y transacción
    conn = get_connection()
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT nombre FROM usuarios WHERE id = %s", (id_usuario,))
        usuario = cursor.fetchone()
        if not usuario:
            return {"error": f"El usuario con ID {id_usuario} no existe."}
        cursor.execute("SELECT nombre FROM veterinarios WHERE id = %s", (id_veterinario,))
        vet = cursor.fetchone()
        if not vet:
            return {"error": f"El veterinario con ID {id_veterinario} no existe."}
        query = """
            INSERT INTO citas (id_usuario, id_veterinario, fecha_cita, hora, razon, mascota)
            VALUES (%s, %s, %s, %s, %s, %s)
        """
        cursor.execute(query, (id_usuario, id_veterinario, fecha_cita, hora, razon, mascota_id))
        conn.commit()
        return {
            "mensaje": "Cita agendada exitosamente",
            "id_cita": cursor.lastrowid,
            "cliente": usuario["nombre"],
            "veterinario": vet["nombre"],
            "fecha": fecha_cita,
            "hora": hora,
            "mascota": tipo_mascota,
        }
    except Exception as e:
        print(f"[Error en agendar_cita]: {str(e)}")
        return {"error": "Ocurrió un error interno al guardar la cita en la base de datos."}
    finally:
        if "cursor" in locals():
            cursor.close()
        conn.close()
    """Wrapper that normaliza argumentos enviados por el LLM.
    - Accepts both `fecha_cita` y `fecha`.
    - If `razon` omitted, usa valor por defecto.
    - Si `tipo_mascota` falta, intenta obtenerlo de `extra` o devuelve error.
    - Ignora claves desconocidas.
    """
    # Compatibilidad de nombres
    if fecha_cita is None:
        fecha_cita = extra.get("fecha")
    if tipo_mascota is None:
        tipo_mascota = extra.get("especie")
    # Validaciones básicas
    if not fecha_cita:
        return {"error": "Falta la fecha de la cita (fecha_cita)."}
    if not tipo_mascota:
        return {"error": "Falta tipo_mascota para la cita."}
    # Delegar a la implementación original (renombrada)
# Removed undefined delegation; implementation follows below

    
    # 1. MAPEADO DE MASCOTA (La pieza que faltaba)
    mapa_mascotas = {"Perro": 1, "Gato": 2, "Roedores": 3, "Reptiles": 4}
    mascota_id = mapa_mascotas.get(tipo_mascota)
    if not mascota_id:
        return {"error": f"La especie '{tipo_mascota}' no es válida. Usa: Perro, Gato, Roedores, Reptiles."}

    # 2. VALIDACIÓN PREVIA (Tu lógica original de fechas y selección)
    try:
        fecha_dt = datetime.strptime(fecha_cita, "%Y-%m-%d")
        if fecha_dt.date() < datetime.now().date():
            return {"error": f"La fecha {fecha_cita} ya pasó. Por favor selecciona una fecha futura."}
    except ValueError:
        return {"error": "Formato de fecha inválido. Usa YYYY-MM-DD."}

    if id_veterinario is None or str(id_veterinario).lower() == "none":
        return {"error": "No se ha seleccionado un veterinario válido. Por favor, especifica con qué especialista deseas la cita."}

    # 3. CONEXIÓN Y TRANSACCIÓN (Tu estructura original)
    conn = get_connection()
    try:
        cursor = conn.cursor(dictionary=True)

        # VALIDAR USUARIO Y VETERINARIO (Tus consultas originales)
        cursor.execute("SELECT nombre FROM usuarios WHERE id = %s", (id_usuario,))
        usuario = cursor.fetchone()
        if not usuario: return {"error": f"El usuario con ID {id_usuario} no existe."}

        cursor.execute("SELECT nombre FROM veterinarios WHERE id = %s", (id_veterinario,))
        vet = cursor.fetchone()
        if not vet: return {"error": f"El veterinario con ID {id_veterinario} no existe."}

        # INSERT (Aquí usamos el mascota_id mapeado)
        query = """
            INSERT INTO citas (id_usuario, id_veterinario, fecha_cita, hora, razon, mascota)
            VALUES (%s, %s, %s, %s, %s, %s)
        """
        # Asegúrate de que los campos coincidan con tu tabla
        cursor.execute(query, (id_usuario, id_veterinario, fecha_cita, hora, razon, mascota_id))
        conn.commit()

        return {
            "mensaje": "Cita agendada exitosamente",
            "id_cita": cursor.lastrowid,
            "cliente": usuario["nombre"],
            "veterinario": vet["nombre"],
            "fecha": fecha_cita,
            "hora": hora,
            "mascota": tipo_mascota
        }

    except Exception as e:
        print(f"[Error en agendar_cita]: {str(e)}")
        return {"error": "Ocurrió un error interno al guardar la cita en la base de datos."}
    finally:
        if 'cursor' in locals(): cursor.close()
        conn.close()


# ─────────────────────────────────────────────
# 7. CONSULTAR SERVICIOS DE UN VETERINARIO
# ─────────────────────────────────────────────

def consultar_servicios_veterinario(id_veterinario: int) -> list[dict]:
    """
    Obtiene la lista de servicios que ofrece un veterinario específico.

    Args:
        id_veterinario: ID numérico del veterinario a consultar
    """
    conn = get_connection()
    try:
        cursor = conn.cursor(dictionary=True)
        query = """
            SELECT s.nombre, s.descripcion
            FROM servicios s
            JOIN veterinario_servicio vs ON s.id = vs.id_servicio
            WHERE vs.id_veterinario = %s
        """
        cursor.execute(query, (id_veterinario,))
        results = cursor.fetchall()
        if not results:
            return [{"mensaje": f"El veterinario con ID {id_veterinario} no tiene servicios asignados o no existe."}]
        return results
    except Exception as e:
        return [{"error": str(e)}]
    finally:
        conn.close()


# ─────────────────────────────────────────────
# 8. BUSCAR USUARIO POR EMAIL
# ─────────────────────────────────────────────

def buscar_usuario_por_email(email: str) -> dict:
    """
    Busca un usuario registrado en MascoTico por su correo electrónico.
    Retorna ID, nombre, celular y rol del usuario (sin contraseña).

    Args:
        email: Correo electrónico del usuario a buscar
    """
    conn = get_connection()
    try:
        cursor = conn.cursor(dictionary=True)
        query = """
            SELECT id, nombre, email, celular, rol
            FROM usuarios
            WHERE email = %s
        """
        cursor.execute(query, (email,))
        result = cursor.fetchone()
        if not result:
            return {"mensaje": f"No se encontró ningún usuario registrado con el correo '{email}'"}
        return result
    except Exception as e:
        return {"error": str(e)}
    finally:
        conn.close()


# ─────────────────────────────────────────────
# 9. CONSULTAR VENTAS POR USUARIO
# ─────────────────────────────────────────────

def consultar_ventas_usuario(id_usuario: int) -> list[dict]:
    """
    Consulta el historial de compras detallado de un usuario específico.
    Agrupa los productos comprados y los muestra por fecha de transacción.

    Args:
        id_usuario: ID numérico del usuario a consultar
    """
    conn = get_connection()
    try:
        cursor = conn.cursor(dictionary=True)
        # Modificado: Se realiza el JOIN con la tabla intermedia 'detalle_venta' 
        # y se extrae el producto por su relación con 'productos'
        query = """
            SELECT p.nombre as producto, p.marca, p.precio, dv.cantidad, v.fecha
            FROM ventas v
            JOIN detalle_venta dv ON v.id = dv.id_venta
            JOIN productos p ON dv.id_producto = p.id
            WHERE v.id_usuario = %s
            ORDER BY v.fecha DESC
            LIMIT 15
        """
        cursor.execute(query, (id_usuario,))
        results = cursor.fetchall()
        if not results:
            return [{"mensaje": f"El usuario con ID {id_usuario} no registra ninguna compra en el sistema."}]
        return results
    except Exception as e:
        return [{"error": str(e)}]
    finally:
        conn.close()

# ─────────────────────────────────────────────
# 10. Filtro de Veterinarios Disponibles
# ─────────────────────────────────────────────

def _format_hora(val) -> str:
    """Normaliza TIME/timedelta/str de MySQL a 'HH:MM'."""
    from datetime import time, timedelta
    if val is None:
        return "09:00"
    if isinstance(val, time):
        return val.strftime("%H:%M")
    if isinstance(val, timedelta):
        total = int(val.total_seconds())
        return f"{total // 3600:02d}:{(total % 3600) // 60:02d}"
    parts = str(val).split(".")[0].split(":")
    hour = int(parts[0])
    minute = int(parts[1]) if len(parts) > 1 else 0
    return f"{hour:02d}:{minute:02d}"


def _parse_hora(hora: str):
    from datetime import datetime, time
    try:
        return datetime.strptime(hora.strip(), "%H:%M").time()
    except ValueError:
        return time(hour=int(hora.split(":")[0]))


def buscar_veterinarios_filtrados(tipo_mascota: str, hora: str) -> list:
    """
    Busca veterinarios que atienden una especie y están dentro de su horario de atención.
    Si nadie cubre la hora exacta, devuelve alternativas con sus horarios.
    """
    conn = get_connection()
    try:
        cursor = conn.cursor(dictionary=True)

        especies = _obtener_especies_registradas(cursor)
        especie = next((e for e in especies if e.lower() == tipo_mascota.lower()), None)
        if not especie:
            return [{
                "error": f"La especie '{tipo_mascota}' no está registrada.",
                "especies_validas": especies,
            }]

        query = """
            SELECT v.id, v.nombre, v.hora_apertura, v.hora_cierre, v.direccion, v.calificacion
            FROM veterinarios v
            JOIN mascotas m ON v.mascota = m.id
            WHERE m.nombre = %s
        """
        cursor.execute(query, (especie,))
        veterinarios = cursor.fetchall()

        solicitud = _parse_hora(hora)
        disponibles = []
        todos = []
        for v in veterinarios:
            item = {
                "id": v["id"],
                "nombre": v["nombre"],
                "hora_apertura": _format_hora(v["hora_apertura"]),
                "hora_cierre": _format_hora(v["hora_cierre"]),
                "direccion": v.get("direccion"),
                "calificacion": float(v["calificacion"]) if v.get("calificacion") is not None else None,
            }
            todos.append(item)
            apertura = _parse_hora(item["hora_apertura"])
            cierre = _parse_hora(item["hora_cierre"])
            if apertura <= solicitud <= cierre:
                disponibles.append(item)

        if disponibles:
            return disponibles
        if todos:
            return [{
                "mensaje": f"Ningún veterinario disponible exactamente a las {hora}.",
                "hora_solicitada": hora,
                "alternativas": todos,
            }]
        return [{"mensaje": f"No hay veterinarios registrados para {especie}."}]
    except Exception as e:
        return [{"error": str(e)}]
    finally:
        conn.close()

def realizar_compra(id_usuario: int, items: list[dict]) -> dict:
    """Registra una compra de productos y genera una venta.

    Parameters
    ----------
    id_usuario: int
        ID del usuario que realiza la compra.
    items: list[dict]
        Lista de ítems a comprar. Cada dict debe contener:
        {"id_producto": int, "cantidad": int}

    Returns
    -------
    dict
        Resultado de la operación o error.
    """
    from decimal import Decimal
    if not items:
        return {"error": "La lista de productos está vacía."}
    conn = get_connection()
    try:
        cursor = conn.cursor(dictionary=True)
        # Verificar usuario
        cursor.execute("SELECT nombre FROM usuarios WHERE id = %s", (id_usuario,))
        usuario = cursor.fetchone()
        if not usuario:
            return {"error": f"El usuario con ID {id_usuario} no existe."}
        total = Decimal("0")
        # Validar stock y precios
        for item in items:
            pid = item.get("id_producto")
            qty = item.get("cantidad")
            if pid is None or qty is None:
                return {"error": "Cada ítem debe contener 'id_producto' y 'cantidad'."}
            cursor.execute("SELECT nombre, precio, stock FROM productos WHERE id = %s", (pid,))
            prod = cursor.fetchone()
            if not prod:
                return {"error": f"Producto con ID {pid} no encontrado."}
            if prod["stock"] < qty:
                return {"error": f"Stock insuficiente para '{prod['nombre']}'. Disponibles: {prod['stock']}, solicitados: {qty}."}
            total += prod["precio"] * Decimal(str(qty))
            # Guardar datos para respuesta
            item["nombre"] = prod["nombre"]
            item["precio_unitario"] = prod["precio"]
        # Insertar venta (cabecera)
        cursor.execute(
            "INSERT INTO ventas (id_usuario, total, estado) VALUES (%s, %s, %s)",
            (id_usuario, total, "pendiente")
        )
        id_venta = cursor.lastrowid
        # Insertar detalle y descontar stock
        for item in items:
            pid = item["id_producto"]
            qty = item["cantidad"]
            precio = item["precio_unitario"]
            cursor.execute(
                "INSERT INTO detalle_venta (id_venta, id_producto, cantidad, precio_unitario, subtotal) VALUES (%s, %s, %s, %s, %s)",
                (id_venta, pid, qty, precio, precio * qty)
            )
            cursor.execute(
                "UPDATE productos SET stock = stock - %s WHERE id = %s",
                (qty, pid)
            )
        conn.commit()
        return {
            "exito": True,
            "id_venta": id_venta,
            "total": round(total, 2),
            "usuario": usuario["nombre"],
            "items": [
                {
                    "id_producto": i["id_producto"],
                    "nombre": i["nombre"],
                    "cantidad": i["cantidad"],
                    "precio_unitario": i["precio_unitario"]
                }
                for i in items
            ]
        }
    except Exception as e:
        conn.rollback()
        print(f"[Error en realizar_compra]: {str(e)}")
        return {"error": "Error interno al procesar la compra."}
    finally:
        if "cursor" in locals():
            cursor.close()
        conn.close()