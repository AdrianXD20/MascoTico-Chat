"""
Servidor FastAPI para el agente MascoTico.
Expone endpoints REST que Node.js consume para el chat con memoria persistente.
"""

import json
import time
from fastapi import FastAPI, HTTPException, UploadFile, File, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from router import clasificar_intencion
from agente_rag import ejecutar_agente_rag
from agente_transaccional import ejecutar_agente_transaccional

from whisper_stt import transcribir_audio

from memory import (
    nueva_conversacion,
    conversacion_existe,
    guardar_mensaje,
    obtener_historial,
    listar_conversaciones,
    eliminar_conversacion,
)

from datetime import datetime

# ─────────────────────────────────────────────
# CONFIGURACIÓN
# ─────────────────────────────────────────────

MODEL = "qwen2.5:3b"
MEMORIA_HERRAMIENTAS_PREFIX = "[Memoria interna para agendamiento — no mostrar al usuario]"

app = FastAPI(title="MascoTico AI Agent", version="1.0.0")

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─────────────────────────────────────────────
# MODELOS DE REQUEST/RESPONSE
# ─────────────────────────────────────────────

class ChatRequest(BaseModel):
    # Acepta tanto "user_id" como "id_usuario" para compatibilidad con Chat.jsx
    user_id:         int | None = None
    id_usuario:      int | None = None
    mensaje:         str
    conversation_id: str | None = None

    def get_user_id(self) -> int | None:
        """Resuelve el ID del usuario sin importar qué campo mandó el frontend."""
        return self.user_id or self.id_usuario


class ChatResponse(BaseModel):
    conversation_id: str
    respuesta:       str
    es_nueva_sesion: bool
    agente_usado:    str              # agente que procesó la solicitud: "rag" | "transaccional" | "fuera_dominio"
    contexto_rag:    str | None = None  # chunks recuperados de ChromaDB (solo cuando agente_usado == "rag")


class ConversacionesResponse(BaseModel):
    conversaciones: list[dict]


# ─────────────────────────────────────────────
# SYSTEM PROMPT BASE (inyectado al iniciar conversación)
# Nota: la lógica transaccional completa (herramientas, prompt, helpers)
# vive en agente_transaccional.py para evitar duplicidad.
# ─────────────────────────────────────────────

SYSTEM_PROMPT_BASE = """Eres un asistente de soporte para MascoTico, una plataforma para el cuidado de mascotas.

Tienes acceso a herramientas para consultar información real de la base de datos.

Reglas:
- Si el usuario decide agendar una cita en un horario en el que ningun veterinario puede, dile que el horario no esta disponible
- CUANDO el usuario confirme o acepte agendar (diga "sí", "dale", "confirmo", "ese está bien", etc.) DESPUÉS de que le mostraste opciones de veterinarios, tu ÚNICA acción permitida es llamar a la función agendar_cita usando function calling. NO respondas con texto de confirmación sin haber llamado primero a la herramienta.
- Usa las herramientas cuando el usuario pregunte sobre veterinarios, productos, citas, blogs, usuarios o ventas.
- Si la pregunta tiene suficiente información para llamar una herramienta, úsala directamente.
- Solo pide información adicional si realmente es indispensable.
- Responde siempre en español de forma clara y amigable.
- Recuerda el contexto de mensajes anteriores en la conversación.

REGLA DE DISTINCIÓN DE HERRAMIENTAS:
- PROHIBIDO: Bajo ninguna circunstancia escribas en tu respuesta de texto nombres de herramientas, llamadas a funciones o etiquetas que simulen acciones de base de datos.
- EJEMPLO PROHIBIDO: No escribas <agendar_cita ... />, no escribas 'buscar_veterinarios_filtrados', no escribas JSON ni llamadas a funciones.
- Las herramientas SOLO se ejecutan mediante function calling automático del sistema. Si necesitas buscar veterinarios, NO escribas nada sobre la herramienta: el sistema la invocará por ti cuando corresponda.
- PERMITIDO: Solo puedes usar etiquetas XML de renderizado visual al final de tu respuesta: <render_productos ... />, <render_cita ... />, <render_veterinario ... /> y <navegar ... />.
- CUALQUIER otra etiqueta que no sea <render_...> o <navegar ... /> será considerada un error grave.
- Si ves un mensaje que empieza con "[Memoria interna para agendamiento", usa los IDs listados ahí al llamar agendar_cita. Nunca copies ese bloque al usuario.

REGLAS DE FORMATO CRÍTICAS:
1. Responde al usuario con texto 100% natural, amigable y limpio.
2. Si la respuesta incluye productos disponibles en el contexto anterior, añade al final del texto la etiqueta XML para cada uno con el formato:
   <render_productos nombre="..." marca="..." precio="..." stock="...">
3. Cuando agendar_cita devuelva éxito, añade al final la etiqueta:
   <render_cita id_cita="..." veterinario="..." fecha="..." hora="..." mascota="..." razon="..." />
4. Cuando muestres opciones de veterinarios, añade una etiqueta por cada uno:
   <render_veterinario id="..." nombre="..." hora_apertura="..." hora_cierre="..." />
5. Nunca muestres JSON crudo ni estructuras de código directamente al usuario.

REGLAS DE MONEDA Y CONVERSIÓN:
- Tus respuestas de texto y los precios en las tarjetas deben estar siempre en Pesos Mexicanos ($ MXN) o Dólares ($ USD).
- Si el contexto o la base de datos te entrega un precio en otra moneda (ej. 35,000 colones), haz tú la conversión matemática mentalmente antes de generar la etiqueta XML.
  (Asume un tipo de cambio aproximado, por ejemplo: 1 USD = 18 MXN).
- En la etiqueta <render_productos>, coloca el precio YA CONVERTIDO en el atributo 'precio', omitiendo símbolos de moneda, solo el número.

REGLAS DE NAVEGACIÓN:
Eres el asistente de MascoTico. Puedes redirigir al usuario usando estas etiquetas al final de tu respuesta:
- <navegar destino="blogs" />
- <navegar destino="tienda" />
- <navegar destino="perfil" />
- <navegar destino="inicio" />
- <navegar destino="citas" />

REGLA DE DESAMBIGUACIÓN CITAS:
- Si el usuario pide "ver mis citas", "mostrar mis citas", "ir a mis citas", "dónde veo mis citas", "llévame a citas/mis citas" o frases equivalentes de NAVEGACIÓN/CONSULTA, responde brevemente confirmando que lo llevas ahí y agrega <navegar destino="citas" />. NO inicies el flujo de agendamiento en este caso (no preguntes tipo de mascota, fecha ni hora).
- Solo inicia el flujo de agendamiento (pidiendo tipo de mascota, fecha, hora, etc.) si el usuario explícitamente pide "agendar", "reservar", "quiero una cita nueva", "necesito consulta con el veterinario" o equivalentes de CREACIÓN.


REGLAS DE AGENDAMIENTO DE CITAS:
1. SIEMPRE verifica primero la disponibilidad usando la herramienta 'buscar_veterinarios_filtrados' cuando el usuario mencione una mascota, fecha u hora.
2. Presenta las opciones con etiquetas <render_veterinario id="..." nombre="..." hora_apertura="..." hora_cierre="..." />.
3. Si el usuario intenta agendar en una fecha pasada, infórmale amablemente y pide una fecha futura.
4. En cuanto el usuario confirme (diga "sí", "dale", "ese", "el primero", "perfecto", etc.), llama INMEDIATAMENTE a 'agendar_cita' sin pedir más confirmación.
5. Al llamar agendar_cita: usa SIEMPRE el id_usuario del CONTEXTO DE SESIÓN ACTUAL (se te indica abajo). NUNCA inventes ni cambies el id_usuario.
6. El id_veterinario DEBE ser el número 'id' del veterinario elegido por el usuario de la lista mostrada.
7. Si el usuario solo había una opción y dice "sí"/"dale", usa ese único veterinario directamente.
8. Si el usuario dice "el primero" → usa el id del primero de la lista. "El segundo" → usa el id del segundo. etc.
9. Tras llamar agendar_cita, si obtienes un resultado con 'mensaje': 'Cita agendada exitosamente', añade la etiqueta <render_cita>.
10. Si obtienes un 'error', informa al usuario del problema sin mentir que la cita fue agendada.

PRIORIDAD DE HERRAMIENTAS:
1. Si el usuario quiere una cita: buscar_veterinarios_filtrados → mostrar opciones → esperar elección → agendar_cita.
2. Si el usuario pregunta por productos (ver, buscar, mostrar): herramienta de productos + <render_productos>.
3. Si el usuario quiere COMPRAR un producto (dice "quiero comprar", "cómprame", "compra", "adquirir"): llama DIRECTAMENTE a realizar_compra con los productos y cantidades mencionados. NO preguntes por citas, fechas ni veterinarios.

SEPARACIÓN ESTRICTA ENTRE COMPRAS Y CITAS:
- COMPRAR un producto y AGENDAR una cita son dos acciones completamente DIFERENTES y NUNCA se mezclan.
- Si el usuario dice "quiero comprar X": SOLO llama a realizar_compra. NUNCA preguntes por fecha, hora ni veterinario.
- Si el usuario dice "quiero una cita": SOLO llama a buscar_veterinarios_filtrados. NUNCA menciones productos ni preguntes qué quiere comprar.
- JAMÁS combines ambos flujos en la misma respuesta.
- EJEMPLO CORRECTO para compra: Usuario dice "quiero comprar 2 pelotas". TÚ llamas a realizar_compra con id_usuario y los items. Listo.
- EJEMPLO INCORRECTO (PROHIBIDO): Usuario dice "quiero comprar 2 pelotas". TÚ preguntas "¿a qué hora quieres tu cita?". ESO ES UN ERROR GRAVE.

REGLA DE NEGOCIACIÓN HORARIA:
1. Si nadie cubre la hora exacta, analiza hora_apertura/hora_cierre de las alternativas.
2. Sugiere: "No hay disponibilidad a las 16:00, pero el Dr. X atiende de 08:00 a 17:00. ¿Agendamos a las 15:00?".

REGLA DE VALIDACIÓN HORARIA ESTRICTA:
1. Cuando el usuario pida una hora, usa buscar_veterinarios_filtrados con esa hora exacta.
2. Si la herramienta devuelve una lista VACÍA ([] o sin resultados): significa que NINGÚN veterinario atiende a esa hora. En ese caso:
   - Responde: "No hay veterinarios disponibles a las HH:MM. Por favor elige una hora entre las disponibles."
   - NO muestres ningún veterinario con <render_veterinario>.
   - NO ofrezcas agendar a ninguna hora.
   - Pide al usuario que proponga otra hora.
3. Si la herramienta devuelve resultados: muestra SOLO los veterinarios que aparecen en esa lista. Esos son los que SÍ están disponibles a esa hora exacta.
4. NUNCA muestres veterinarios que no estén en el resultado de buscar_veterinarios_filtrados para la hora pedida.
5. NUNCA asumas que un veterinario está disponible porque su horario "podría" cubrir la hora — confía SOLO en lo que devuelve la herramienta.
"""


# ─────────────────────────────────────────────
# ENDPOINTS
# ─────────────────────────────────────────────

@app.get("/")
@limiter.limit("30/minute")
def health_check(request: Request):
    return {"status": "ok", "modelo": MODEL}


@app.post("/transcribir")
@limiter.limit("10/minute")
async def transcribir(request: Request, audio: UploadFile = File(...)):
    inicio_total = time.time()
    try:
        audio_bytes = await audio.read()
        extension = audio.filename.split(".")[-1] if audio.filename else "webm"
        resultado = transcribir_audio(audio_bytes, extension=extension)
        resultado["tiempo_total_endpoint_ms"] = round((time.time() - inicio_total) * 1000, 2)
        return resultado
    except Exception as exc:
        print(f"[API] ⚠️  Error transcribiendo audio: {exc}")
        raise HTTPException(status_code=500, detail=f"Error al transcribir: {str(exc)}")


@app.post("/chat", response_model=ChatResponse)
@limiter.limit("20/minute")
def chat(request: Request, req: ChatRequest):
    """
    Endpoint principal del chat con memoria persistente.
    Usa un Router para clasificar la intención y delegar
    al agente especialista correspondiente (RAG o Transaccional).
    """
    # ── Resolver ID del usuario ──────────────────
    user_id = req.get_user_id()

    if not user_id:
        raise HTTPException(
            status_code=400,
            detail="Se requiere id_usuario o user_id para usar el chat"
        )

    es_nueva = False

    # ── Resolver conversation_id ─────────────────
    if not req.conversation_id:
        conversation_id = nueva_conversacion(user_id)
        es_nueva = True

        fecha_hoy = datetime.now().strftime("%Y-%m-%d")

        # System prompt dinámico con el ID real del usuario inyectado
        # (lo sigue usando el agente Transaccional para agendar/comprar)
        system_prompt = SYSTEM_PROMPT_BASE + f"""
CONTEXTO DE SESIÓN ACTUAL (MUY IMPORTANTE):
- LA FECHA DE HOY ES {fecha_hoy}. Usa esto para calcular "mañana".
- El usuario autenticado que está chateando ahora tiene ID = {user_id}
- Cuando necesites llamar a "agendar_cita", SIEMPRE usa id_usuario = {user_id}
- REGLA DE ORO: Antes de agendar, ejecuta "buscar_veterinarios_filtrados" con la especie y hora para ver quién está disponible.
- NUNCA inventes, cambies ni omitas el ID de usuario. Es el único ID válido para esta sesión.
"""
        guardar_mensaje(conversation_id, user_id, "system", system_prompt)

    else:
        conversation_id = req.conversation_id

        if not conversacion_existe(conversation_id, user_id):
            raise HTTPException(
                status_code=404,
                detail="Conversación no encontrada o no pertenece a este usuario"
            )

    # ── Guardar mensaje del usuario ──────────────
    guardar_mensaje(conversation_id, user_id, "user", req.mensaje)

    # ── Recuperar historial con ventana deslizante ──
    historial = obtener_historial(conversation_id)

    # ── Router: clasificar intención ─────────────
    try:
        intencion = clasificar_intencion(req.mensaje, historial)
        print(f"[Router] Intención clasificada: {intencion}")
    except Exception as exc:
        print(f"[Router] ⚠️  Error clasificando, usando fallback 'transaccional': {exc}")
        intencion = "transaccional"  # fallback seguro: al menos puede usar tools

    # ── Delegar al agente especialista correspondiente ──
    memoria_herramientas = {}
    contexto_rag = None

    try:
        if intencion == "rag":
            respuesta, contexto_rag = ejecutar_agente_rag(req.mensaje, historial)

        elif intencion == "transaccional":
            respuesta, memoria_herramientas = ejecutar_agente_transaccional(
                historial, user_id, conversation_id
            )

        else:  # fuera_dominio
            respuesta = "Solo puedo ayudarte con temas relacionados a MascoTico 🐾. ¿Tienes alguna duda sobre nuestros servicios, productos o citas?"

    except Exception as exc:
        print(f"[API] ⚠️  Error crítico del agente ({intencion}): {exc}")
        raise HTTPException(status_code=500, detail=f"Error del agente: {str(exc)}")

    # ── Guardar respuesta del asistente ──────────
    guardar_mensaje(conversation_id, user_id, "assistant", respuesta)

    # Persistir IDs de veterinarios para que el siguiente mensaje pueda agendar
    vets = memoria_herramientas.get("veterinarios_recientes")
    if vets:
        guardar_mensaje(
            conversation_id,
            user_id,
            "system",
            f"{MEMORIA_HERRAMIENTAS_PREFIX} Veterinarios consultados recientemente: "
            + json.dumps(vets, ensure_ascii=False, default=str),
        )

    return ChatResponse(
        conversation_id=conversation_id,
        respuesta=respuesta,
        es_nueva_sesion=es_nueva,
        agente_usado=intencion,        # nuevo
        contexto_rag=contexto_rag,     # nuevo (None si no fue agente RAG)
    )


@app.get("/conversaciones/{user_id}", response_model=ConversacionesResponse)
@limiter.limit("30/minute")
def get_conversaciones(request: Request, user_id: int):
    conversaciones = listar_conversaciones(user_id)
    return ConversacionesResponse(conversaciones=conversaciones)


@app.delete("/conversaciones/{conversation_id}")
@limiter.limit("10/minute")
def delete_conversacion(request: Request, conversation_id: str, user_id: int):
    eliminada = eliminar_conversacion(conversation_id, user_id)
    if not eliminada:
        raise HTTPException(
            status_code=404,
            detail="Conversación no encontrada o no pertenece a este usuario"
        )
    return {"mensaje": "Conversación eliminada correctamente"}


# ─────────────────────────────────────────────
# MAIN
# ─────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api:app", host="0.0.0.0", port=8000, reload=True)