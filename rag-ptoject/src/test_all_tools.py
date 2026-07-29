"""
Test completo de todas las funciones user-facing del RAG.
Ejecutar desde raiz: .venv\Scripts\python.exe src\test_all_tools.py
"""
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__)))

from tools import (
    buscar_veterinarios_por_mascota,
    buscar_veterinarios_filtrados,
    buscar_productos_por_categoria,
    consultar_stock_producto,
    buscar_blogs_por_categoria,
    consultar_servicios_veterinario,
    agendar_cita,
    buscar_usuario_por_email,
    consultar_ventas_usuario,
)

PASS = "PASS"
FAIL = "FAIL"

def check(nombre, result):
    has_error = (
        (isinstance(result, dict) and "error" in result) or
        (isinstance(result, list) and result and isinstance(result[0], dict) and "error" in result[0])
    )
    status = FAIL if has_error else PASS
    preview = str(result)[:120].replace("\n", " ")
    print(f"[{status}] {nombre}: {preview}")
    return not has_error

print("=" * 70)
print("TEST DE HERRAMIENTAS USER-FACING - MascoTico RAG")
print("=" * 70)
resultados = []

# 1. Buscar veterinarios por mascota
resultados.append(check("buscar_veterinarios_por_mascota(Perro)",
    buscar_veterinarios_por_mascota("Perro")))

resultados.append(check("buscar_veterinarios_por_mascota(Gato)",
    buscar_veterinarios_por_mascota("Gato")))

resultados.append(check("buscar_veterinarios_por_mascota(Cocodrilo) -> debe decir no registrado",
    buscar_veterinarios_por_mascota("Cocodrilo")))

# 2. Buscar veterinarios filtrados por hora
resultados.append(check("buscar_veterinarios_filtrados(Perro, 10:00)",
    buscar_veterinarios_filtrados("Perro", "10:00")))

resultados.append(check("buscar_veterinarios_filtrados(Gato, 18:00)",
    buscar_veterinarios_filtrados("Gato", "18:00")))

# 3. Buscar productos por categoria
resultados.append(check("buscar_productos_por_categoria(Perro)",
    buscar_productos_por_categoria("Perro")))

resultados.append(check("buscar_productos_por_categoria(Gato)",
    buscar_productos_por_categoria("Gato")))

resultados.append(check("buscar_productos_por_categoria(Reptiles)",
    buscar_productos_por_categoria("Reptiles")))

# 4. Consultar stock de producto
resultados.append(check("consultar_stock_producto(Royal Canin)",
    consultar_stock_producto("Royal Canin")))

resultados.append(check("consultar_stock_producto(NexGard)",
    consultar_stock_producto("NexGard")))

# 5. Buscar blogs por categoria
resultados.append(check("buscar_blogs_por_categoria(Salud)",
    buscar_blogs_por_categoria("Salud")))

resultados.append(check("buscar_blogs_por_categoria(Nutricion)",
    buscar_blogs_por_categoria("Nutricion")))

resultados.append(check("buscar_blogs_por_categoria(Exoticos)",
    buscar_blogs_por_categoria("Exoticos")))

# 6. Consultar servicios de veterinario
resultados.append(check("consultar_servicios_veterinario(id=1)",
    consultar_servicios_veterinario(1)))

resultados.append(check("consultar_servicios_veterinario(id=3)",
    consultar_servicios_veterinario(3)))

# 7. Buscar usuario por email
resultados.append(check("buscar_usuario_por_email(carlos.solis@gmail.com)",
    buscar_usuario_por_email("carlos.solis@gmail.com")))

resultados.append(check("buscar_usuario_por_email(noexiste@mail.com) -> mensaje no encontrado",
    buscar_usuario_por_email("noexiste@mail.com")))

# 8. Consultar ventas usuario
resultados.append(check("consultar_ventas_usuario(id=1)",
    consultar_ventas_usuario(1)))

# 9. Agendar cita (user ya existente con id=4)
resultados.append(check("agendar_cita(id_usuario=4, id_veterinario=2, fecha=2026-07-20)",
    agendar_cita(
        id_usuario=4,
        id_veterinario=2,
        fecha_cita="2026-07-20",
        razon="Revision de piel",
        tipo_mascota="Perro",
        hora="10:00"
    )))

print()
print("=" * 70)
aprobadas = sum(resultados)
total = len(resultados)
print(f"RESULTADO FINAL: {aprobadas}/{total} herramientas funcionando correctamente")
print("=" * 70)
