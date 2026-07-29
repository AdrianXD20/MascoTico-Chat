"""
Test de agendar_cita - ejecutar desde la carpeta src/
"""
from tools import agendar_cita

resultado = agendar_cita(
    id_usuario=4,
    id_veterinario=1,
    fecha_cita="2026-07-05",
    razon="Consulta general",
    tipo_mascota="Perro",
    hora="16:00"
)
print(resultado)
