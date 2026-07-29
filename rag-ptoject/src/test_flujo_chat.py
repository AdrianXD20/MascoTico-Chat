"""
Simula el flujo completo del agente como lo haría el chat:
LLM -> tool_call -> ejecutar herramienta -> respuesta final
"""
import sys, os, json
sys.path.insert(0, os.path.dirname(__file__))
import ollama
from tools import buscar_veterinarios_filtrados, agendar_cita

MODEL = "qwen2.5:7b"
USER_ID = 4

TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "buscar_veterinarios_filtrados",
            "description": "Busca veterinarios que atienden un tipo de mascota y están disponibles a una hora específica.",
            "parameters": {
                "type": "object",
                "properties": {
                    "tipo_mascota": {"type": "string", "enum": ["Perro", "Gato", "Roedores", "Reptiles"]},
                    "hora": {"type": "string", "description": "Hora en formato HH:MM"}
                },
                "required": ["tipo_mascota", "hora"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "agendar_cita",
            "description": "Registra una cita veterinaria. REQUIERE: id_usuario, id_veterinario, fecha_cita, razon, tipo_mascota.",
            "parameters": {
                "type": "object",
                "properties": {
                    "id_usuario":     {"type": "integer", "description": f"ID del usuario. SIEMPRE usa {USER_ID}"},
                    "id_veterinario": {"type": "integer", "description": "ID del veterinario elegido"},
                    "fecha_cita":     {"type": "string",  "description": "Fecha YYYY-MM-DD"},
                    "hora":           {"type": "string",  "description": "Hora HH:MM"},
                    "razon":          {"type": "string"},
                    "tipo_mascota":   {"type": "string",  "enum": ["Perro", "Gato", "Roedores", "Reptiles"]}
                },
                "required": ["id_usuario", "id_veterinario", "fecha_cita", "razon", "tipo_mascota"]
            }
        }
    }
]

AVAILABLE = {
    "buscar_veterinarios_filtrados": buscar_veterinarios_filtrados,
    "agendar_cita": agendar_cita,
}

messages = [
    {"role": "system", "content": f"Eres el asistente de MascoTico. El usuario autenticado tiene id_usuario = {USER_ID}. SIEMPRE usa ese id_usuario al llamar agendar_cita. Cuando el usuario confirme, usa directamente agendar_cita con los datos recopilados."},
    {"role": "user", "content": "Quiero agendar una cita para mi perro el 2026-07-15 a las 10:00, motivo: vacunacion anual"},
]

print("Ronda 1 - enviando al LLM...")
resp = ollama.chat(model=MODEL, messages=messages, tools=TOOLS)
msg = resp["message"]
print("tool_calls:", msg.get("tool_calls"))
print("content:", msg.get("content", "")[:200])

if msg.get("tool_calls"):
    messages.append({"role": "assistant", "content": msg.get("content", ""), "tool_calls": msg["tool_calls"]})
    for tc in msg["tool_calls"]:
        fn = tc["function"]["name"]
        args = tc["function"]["arguments"]
        print(f"\nEjecutando: {fn} con args: {args}")
        # Forzar id_usuario si es agendar_cita
        if fn == "agendar_cita":
            args.setdefault("id_usuario", USER_ID)
        result = AVAILABLE[fn](**args)
        print(f"Resultado: {result}")
        messages.append({"role": "tool", "content": json.dumps(result, ensure_ascii=False, default=str)})

    print("\nRonda 2 - respuesta final del LLM...")
    # Si fue buscar_veterinarios y el usuario no ha confirmado, simular confirmacion
    messages.append({"role": "user", "content": "Si, el primero esta bien, confirmame la cita"})
    resp2 = ollama.chat(model=MODEL, messages=messages, tools=TOOLS)
    msg2 = resp2["message"]
    print("tool_calls ronda 2:", msg2.get("tool_calls"))
    print("content ronda 2:", msg2.get("content", "")[:300])

    if msg2.get("tool_calls"):
        messages.append({"role": "assistant", "content": msg2.get("content", ""), "tool_calls": msg2["tool_calls"]})
        for tc in msg2["tool_calls"]:
            fn = tc["function"]["name"]
            args = tc["function"]["arguments"]
            print(f"\nEjecutando ronda 2: {fn} con args: {args}")
            if fn == "agendar_cita":
                args.setdefault("id_usuario", USER_ID)
            result = AVAILABLE[fn](**args)
            print(f"Resultado: {result}")
