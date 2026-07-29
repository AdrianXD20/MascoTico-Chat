"""
Diagnostico completo del flujo de agendamiento desde chat.
Corre desde src/ con: .venv\Scripts\python.exe src\test_diagnostico.py
"""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))

from tools import buscar_veterinarios_filtrados, agendar_cita

print("=" * 60)
print("TEST 1: buscar_veterinarios_filtrados(Perro, 16:00)")
print("=" * 60)
r1 = buscar_veterinarios_filtrados("Perro", "16:00")
print(r1)

print()
print("=" * 60)
print("TEST 2: agendar_cita directa (id_usuario=4, id_veterinario=1)")
print("=" * 60)
r2 = agendar_cita(
    id_usuario=4,
    id_veterinario=1,
    fecha_cita="2026-07-10",
    razon="Vacunacion anual",
    tipo_mascota="Perro",
    hora="16:00"
)
print(r2)
