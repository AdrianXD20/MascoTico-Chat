"""
Módulo de transcripción de voz a texto usando Whisper local (faster-whisper).
Optimizado para correr en CPU con modelo cuantizado.
"""

import time
import tempfile
import os
from faster_whisper import WhisperModel

# ─────────────────────────────────────────────
# CONFIGURACIÓN DEL MODELO
# ─────────────────────────────────────────────

# tiny = más rápido, menor precisión | base = más lento, mejor precisión
MODEL_SIZE = "tiny"

# int8 = cuantizado, mucho más rápido en CPU que float32
COMPUTE_TYPE = "int8"

print(f"[Whisper] Cargando modelo '{MODEL_SIZE}' (compute_type={COMPUTE_TYPE})...")
_inicio_carga = time.time()

model = WhisperModel(MODEL_SIZE, device="cpu", compute_type=COMPUTE_TYPE)

print(f"[Whisper] Modelo cargado en {time.time() - _inicio_carga:.2f}s")


# ─────────────────────────────────────────────
# FUNCIÓN DE TRANSCRIPCIÓN
# ─────────────────────────────────────────────

def transcribir_audio(audio_bytes: bytes, extension: str = "webm") -> dict:
    """
    Transcribe un archivo de audio a texto usando Whisper local.
    Guarda el audio temporalmente en disco porque faster-whisper lee de archivo.

    Args:
        audio_bytes: Contenido binario del archivo de audio
        extension: Extensión del archivo (webm, mp3, wav, etc.)

    Returns:
        dict con: texto transcrito, idioma detectado, y métricas de tiempo
    """
    inicio = time.time()

    # Guardar temporalmente — faster-whisper necesita una ruta de archivo
    with tempfile.NamedTemporaryFile(suffix=f".{extension}", delete=False) as tmp:
        tmp.write(audio_bytes)
        tmp_path = tmp.name

    try:
        segments, info = model.transcribe(tmp_path, language="es", beam_size=1)

        # Concatenar todos los segmentos en un solo texto
        texto = " ".join(segment.text.strip() for segment in segments)

        tiempo_total = time.time() - inicio

        print(f"[Whisper] Transcripción completada en {tiempo_total:.2f}s")
        print(f"[Whisper] Texto: {texto}")

        return {
            "texto": texto.strip(),
            "idioma_detectado": info.language,
            "confianza_idioma": round(info.language_probability, 2),
            "tiempo_transcripcion_ms": round(tiempo_total * 1000, 2)
        }

    finally:
        # Limpiar el archivo temporal siempre
        os.unlink(tmp_path)