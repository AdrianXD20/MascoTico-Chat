# seeder.py
"""
Script de sembrado masivo para la tabla 'citas'.
Genera datos ficticios pero coherentes usando Bulk Insert
(una sola transacción, no miles de INSERT individuales).
"""

import os
import random
from datetime import datetime, timedelta
import mysql.connector
from faker import Faker

fake = Faker('es_MX')

# ─────────────────────────────────────────────
# CONFIGURACIÓN
# ─────────────────────────────────────────────

TOTAL_REGISTROS = 10000   # cambia a 50000 si quieres apuntar a nivel Excelente

IDS_USUARIOS = list(range(1, 6))       # 1 a 5
IDS_VETERINARIOS = list(range(1, 5))   # 1 a 4
TIPOS_MASCOTA = [1, 2, 3, 4]           # 1=Perro, 2=Gato, 3=Roedores, 4=Reptiles

RAZONES_POSIBLES = [
    "Consulta general",
    "Vacunación anual",
    "Revisión de rutina",
    "Control de peso",
    "Desparasitación",
    "Chequeo dental",
    "Cirugía menor",
    "Consulta por vómito y diarrea",
    "Corte de uñas y baño",
    "Seguimiento post-operatorio",
]


def generar_hora_aleatoria() -> str:
    hora = random.randint(8, 17)
    minuto = random.choice([0, 15, 30, 45])
    return f"{hora:02d}:{minuto:02d}"


def generar_citas(n: int) -> list[tuple]:
    citas = []
    for _ in range(n):
        fecha = fake.date_time_between(start_date='-6M', end_date='+3M')
        citas.append((
            random.choice(IDS_USUARIOS),
            random.choice(IDS_VETERINARIOS),
            fecha.strftime('%Y-%m-%d'),
            random.choice(RAZONES_POSIBLES),
            random.choice(TIPOS_MASCOTA),
            generar_hora_aleatoria(),
        ))
    return citas


def sembrar():
    conn = mysql.connector.connect(
        host=os.environ.get("DB_HOST"),
        user=os.environ.get("DB_USER"),
        password=os.environ.get("DB_PASSWORD"),
        database=os.environ.get("DB_NAME"),
    )
    cursor = conn.cursor()

    print(f"Generando {TOTAL_REGISTROS} registros ficticios...")
    datos = generar_citas(TOTAL_REGISTROS)

    query = """
        INSERT INTO citas (id_usuario, id_veterinario, fecha_cita, razon, mascota, hora)
        VALUES (%s, %s, %s, %s, %s, %s)
    """

    inicio = datetime.now()

    # Bulk insert real: una sola transacción, no miles de commits sueltos
    cursor.executemany(query, datos)
    conn.commit()

    duracion = (datetime.now() - inicio).total_seconds()

    print(f"✅ {len(datos)} registros insertados en {duracion:.2f} segundos")
    print(f"   (~{len(datos)/duracion:.0f} registros/segundo)")

    cursor.execute("SELECT COUNT(*) FROM citas")
    total = cursor.fetchone()[0]
    print(f"📊 Total de citas en la BD ahora: {total}")

    cursor.close()
    conn.close()


if __name__ == "__main__":
    sembrar()