"""
Agente de Function Calling para MascoTico.
Usa qwen2.5:7b con Ollama para interpretar preguntas del usuario,
decidir qué función ejecutar, interceptar el tool_call y retornar
la respuesta final.
"""

import json
import threading
import tkinter as tk
from tkinter import scrolledtext
import ollama
from datetime import datetime

from tools import (
    buscar_veterinarios_por_mascota,
    consultar_citas_veterinario,
    buscar_productos_por_categoria,
    consultar_stock_producto,
    buscar_blogs_por_categoria,
    agendar_cita,
    consultar_servicios_veterinario,
    buscar_usuario_por_email,
    consultar_ventas_usuario,
)

# ─────────────────────────────────────────────
# MODELO
# ─────────────────────────────────────────────

MODEL = "qwen3:1.7b"

# ─────────────────────────────────────────────
# DEFINICIÓN DE HERRAMIENTAS PARA EL LLM
# ─────────────────────────────────────────────

TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "buscar_veterinarios_por_mascota",
            "description": "Busca veterinarios disponibles según el tipo de mascota que atienden",
            "parameters": {
                "type": "object",
                "properties": {
                    "tipo_mascota": {
                        "type": "string",
                        "description": "Tipo de mascota",
                        "enum": ["Perro", "Gato", "Roedores", "Reptiles"]
                    }
                },
                "required": ["tipo_mascota"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "consultar_citas_veterinario",
            "description": "Consulta las citas agendadas para un veterinario específico por su ID",
            "parameters": {
                "type": "object",
                "properties": {
                    "id_veterinario": {
                        "type": "integer",
                        "description": "ID numérico del veterinario"
                    }
                },
                "required": ["id_veterinario"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "buscar_productos_por_categoria",
            "description": "Busca productos disponibles en la tienda según el tipo de mascota",
            "parameters": {
                "type": "object",
                "properties": {
                    "categoria": {
                        "type": "string",
                        "description": "Tipo de mascota para filtrar productos",
                        "enum": ["Perro", "Gato", "Roedores", "Reptiles"]
                    }
                },
                "required": ["categoria"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "consultar_stock_producto",
            "description": "Consulta el stock y precio de un producto específico por nombre",
            "parameters": {
                "type": "object",
                "properties": {
                    "nombre_producto": {
                        "type": "string",
                        "description": "Nombre o parte del nombre del producto"
                    }
                },
                "required": ["nombre_producto"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "buscar_blogs_por_categoria",
            "description": "Busca blogs informativos escritos por veterinarios. La categoría es el TEMA del blog, NO el tipo de mascota.",
            "parameters": {
                "type": "object",
                "properties": {
                    "categoria": {
                        "type": "string",
                        "description": "Tema del blog. Valores válidos: Salud y Prevención, Nutrición y Dieta, Comportamiento y Adiestramiento, Guía de Cuidados de Exóticos",
                        "enum": ["Salud y Prevención", "Nutrición y Dieta", "Comportamiento y Adiestramiento", "Guía de Cuidados de Exóticos"]
                    }
                },
                "required": ["categoria"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "agendar_cita",
            "description": "Registra una nueva cita veterinaria. Requiere ID del usuario, ID del veterinario, fecha, motivo y tipo de mascota.",
            "parameters": {
                "type": "object",
                "properties": {
                    "id_usuario": {
                        "type": "integer",
                        "description": "ID numérico del usuario/cliente que agenda la cita"
                    },
                    "id_veterinario": {
                        "type": "integer",
                        "description": "ID del veterinario seleccionado"
                    },
                    "fecha_cita": {
                        "type": "string",
                        "description": "Fecha en formato YYYY-MM-DD"
                    },
                    "razon": {
                        "type": "string",
                        "description": "Motivo de la consulta veterinaria"
                    },
                    "tipo_mascota": {
                        "type": "string",
                        "description": "Tipo de mascota",
                        "enum": ["Perro", "Gato", "Roedores", "Reptiles"]
                    }
                },
                "required": ["id_usuario", "id_veterinario", "fecha_cita", "razon", "tipo_mascota"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "consultar_servicios_veterinario",
            "description": "Obtiene los servicios que ofrece un veterinario como vacunación, cirugía, baño y corte, consulta general",
            "parameters": {
                "type": "object",
                "properties": {
                    "id_veterinario": {
                        "type": "integer",
                        "description": "ID numérico del veterinario"
                    }
                },
                "required": ["id_veterinario"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "buscar_usuario_por_email",
            "description": "Busca un usuario registrado en MascoTico por su correo electrónico",
            "parameters": {
                "type": "object",
                "properties": {
                    "email": {
                        "type": "string",
                        "description": "Correo electrónico del usuario"
                    }
                },
                "required": ["email"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "consultar_ventas_usuario",
            "description": "Consulta el historial de compras de un usuario por su ID",
            "parameters": {
                "type": "object",
                "properties": {
                    "id_usuario": {
                        "type": "integer",
                        "description": "ID numérico del usuario"
                    }
                },
                "required": ["id_usuario"]
            }
        }
    }
]

# ─────────────────────────────────────────────
# MAPA DE FUNCIONES
# ─────────────────────────────────────────────

AVAILABLE_FUNCTIONS = {
    "buscar_veterinarios_por_mascota": buscar_veterinarios_por_mascota,
    "consultar_citas_veterinario": consultar_citas_veterinario,
    "buscar_productos_por_categoria": buscar_productos_por_categoria,
    "consultar_stock_producto": consultar_stock_producto,
    "buscar_blogs_por_categoria": buscar_blogs_por_categoria,
    "agendar_cita": agendar_cita,
    "consultar_servicios_veterinario": consultar_servicios_veterinario,
    "buscar_usuario_por_email": buscar_usuario_por_email,
    "consultar_ventas_usuario": consultar_ventas_usuario,
}

# ─────────────────────────────────────────────
# SYSTEM PROMPT
# ─────────────────────────────────────────────

def obtener_system_prompt() -> str:
    fecha_hoy = datetime.now().strftime("%Y-%m-%d")
    return f"""Eres un asistente de soporte para MascoTico, una plataforma para el cuidado de mascotas.

Tienes acceso a herramientas para consultar información real de la base de datos.
Reglas críticas:
- La fecha actual de hoy es {fecha_hoy}. Utiliza esta fecha para calcular fechas relativas como "mañana", "el próximo lunes", etc. y convertirlas a formato YYYY-MM-DD antes de llamar a las herramientas.
- Si el usuario te pide agendar una cita, DEBES llamar a la herramienta `agendar_cita`.
- NO inventes datos. Si te falta alguno de los parámetros obligatorios (como el nombre del cliente, ID del veterinario, fecha en formato YYYY-MM-DD, motivo o tipo de mascota), pídelos amigablemente al usuario en lugar de llamar a la herramienta.
- NO confirmes ni digas que una cita ha sido agendada a menos que la herramienta `agendar_cita` te devuelva un mensaje de éxito.
- Si la herramienta devuelve un resultado con un error o excepción (por ejemplo, que el veterinario no existe), informa al usuario del problema y dile que la cita NO se pudo agendar.
- Responde siempre en español de forma clara y amigable."""


# ─────────────────────────────────────────────
# LÓGICA DEL AGENTE
# ─────────────────────────────────────────────

def run_agent(user_message: str) -> str:
    """
    Ciclo completo del agente:
    1. Envía el mensaje al LLM con las herramientas disponibles
    2. Intercepta tool_calls si el modelo decide usar una herramienta
    3. Ejecuta la función real en el backend
    4. Devuelve el resultado al LLM para generar la respuesta final
    """
    messages = [
        {"role": "system", "content": obtener_system_prompt()},
        {"role": "user",   "content": user_message}
    ]

    print("\n[Agente] Enviando mensaje al LLM...\n")

    response = ollama.chat(model=MODEL, messages=messages, tools=TOOLS, think=False, options={"num_ctx": 4096, "num_predict": 700})
    message  = response["message"]

    if not message.get("tool_calls"):
        return message["content"]

    # ── Hay tool_calls ──────────────────────────
    print(f"[Agente] Tool call detectado: {len(message['tool_calls'])} herramienta(s)\n")
    messages.append({
        "role": "assistant",
        "content": message.get("content", ""),
        "tool_calls": message["tool_calls"]
    })

    for tool_call in message["tool_calls"]:
        fn_name   = tool_call["function"]["name"]
        arguments = tool_call["function"]["arguments"]

        print(f"[Agente] Ejecutando : {fn_name}")
        print(f"[Agente] Argumentos : {json.dumps(arguments, ensure_ascii=False)}\n")

        if fn_name not in AVAILABLE_FUNCTIONS:
            result = {"error": f"Función '{fn_name}' no encontrada"}
        else:
            try:
                result = AVAILABLE_FUNCTIONS[fn_name](**arguments)
                if isinstance(result, dict) and "error" in result:
                    print(f"[Agente] ⚠️  La herramienta '{fn_name}' retornó un error: {result['error']}")
            except Exception as exc:
                result = {"error": f"Error en {fn_name}: {exc}"}
                print(f"[Agente] ⚠️  Error en {fn_name}: {exc}")

        print(f"[Agente] Resultado  : {json.dumps(result, ensure_ascii=False, default=str)}\n")

        messages.append({
            "role": "tool",
            "content": json.dumps(result, ensure_ascii=False, default=str)
        })

    final = ollama.chat(model=MODEL, messages=messages, tools=TOOLS, think=False, options={"num_ctx": 4096, "num_predict": 700})
    return final["message"]["content"]


# ─────────────────────────────────────────────
# INTERFAZ GRÁFICA
# ─────────────────────────────────────────────

BG        = "#1e1e2e"
BG_PANEL  = "#2a2a3d"
ACCENT    = "#7c6af7"
FG        = "#e0e0f0"
FG_DIM    = "#888aaa"
FONT_CHAT = ("Segoe UI", 10)
FONT_HEAD = ("Segoe UI", 11, "bold")


def append_message(text_widget: scrolledtext.ScrolledText, role: str, content: str) -> None:
    """Inserta un mensaje en el chat con colores según el rol."""
    text_widget.config(state=tk.NORMAL)
    tag = role.lower()
    text_widget.insert(tk.END, f"{role}\n", (tag + "_role",))
    text_widget.insert(tk.END, f"{content}\n\n", (tag + "_body",))
    text_widget.see(tk.END)
    text_widget.config(state=tk.DISABLED)


def _worker(user_message: str, chat: scrolledtext.ScrolledText,
            send_btn: tk.Button, status: tk.Label) -> None:
    """Corre el agente en un hilo secundario para no bloquear la GUI."""
    try:
        response = run_agent(user_message)
    except Exception as exc:
        response = f"⚠️ Error: {exc}"

    def update_ui():
        append_message(chat, "MascoTico", response)
        send_btn.config(state=tk.NORMAL, text="Enviar")
        status.config(text="Listo ✓")

    chat.after(0, update_ui)


def on_send(chat: scrolledtext.ScrolledText, input_box: tk.Text,
            send_btn: tk.Button, status: tk.Label) -> None:
    user_message = input_box.get("1.0", tk.END).strip()
    if not user_message:
        return

    append_message(chat, "Tú", user_message)
    input_box.delete("1.0", tk.END)
    send_btn.config(state=tk.DISABLED, text="Pensando...")
    status.config(text="Procesando...")

    threading.Thread(
        target=_worker,
        args=(user_message, chat, send_btn, status),
        daemon=True
    ).start()


def run_gui() -> None:
    root = tk.Tk()
    root.title("MascoTico — Asistente IA")
    root.geometry("820x640")
    root.configure(bg=BG)
    root.resizable(True, True)

    # ── Header ──────────────────────────────────
    header = tk.Frame(root, bg=ACCENT, pady=10)
    header.pack(fill=tk.X)
    tk.Label(header, text="🐾  MascoTico  —  Asistente IA",
             bg=ACCENT, fg="white", font=("Segoe UI", 13, "bold")).pack()

    # ── Chat ────────────────────────────────────
    chat = scrolledtext.ScrolledText(
        root, wrap=tk.WORD, state=tk.DISABLED,
        font=FONT_CHAT, bg=BG_PANEL, fg=FG,
        insertbackground=FG, padx=14, pady=10,
        relief=tk.FLAT, bd=0
    )
    chat.pack(fill=tk.BOTH, expand=True, padx=14, pady=(12, 6))

    # Etiquetas de color por rol
    chat.tag_config("tú_role",        foreground=ACCENT,   font=("Segoe UI", 9, "bold"))
    chat.tag_config("tú_body",        foreground=FG)
    chat.tag_config("mascotico_role", foreground="#4caf8a", font=("Segoe UI", 9, "bold"))
    chat.tag_config("mascotico_body", foreground=FG)
    chat.tag_config("sistema_role",   foreground=FG_DIM,   font=("Segoe UI", 9, "bold"))
    chat.tag_config("sistema_body",   foreground=FG_DIM)

    # ── Input ───────────────────────────────────
    input_frame = tk.Frame(root, bg=BG_PANEL, padx=10, pady=8)
    input_frame.pack(fill=tk.X, padx=14, pady=(0, 6))

    input_box = tk.Text(
        input_frame, height=4, wrap=tk.WORD,
        font=FONT_CHAT, bg=BG, fg=FG,
        insertbackground=FG, relief=tk.FLAT, bd=0
    )
    input_box.pack(fill=tk.X, expand=True, side=tk.LEFT, padx=(0, 10))

    send_btn = tk.Button(
        input_frame, text="Enviar", width=10,
        bg=ACCENT, fg="white", font=FONT_HEAD,
        activebackground="#6253d0", activeforeground="white",
        relief=tk.FLAT, cursor="hand2",
        command=lambda: on_send(chat, input_box, send_btn, status)
    )
    send_btn.pack(side=tk.RIGHT, ipady=6)

    # Ctrl+Enter para enviar
    root.bind("<Control-Return>", lambda e: on_send(chat, input_box, send_btn, status))

    # ── Status bar ──────────────────────────────
    status = tk.Label(root, text="Listo ✓", bg=BG, fg=FG_DIM,
                      font=("Segoe UI", 8), anchor="w")
    status.pack(fill=tk.X, padx=16, pady=(0, 8))

    # Mensaje de bienvenida
    append_message(chat, "Sistema",
                   "Bienvenido a MascoTico 🐾\n"
                   "Puedes preguntarme sobre veterinarios, productos, citas, blogs y más.\n"
                   "Usa Ctrl+Enter o el botón Enviar.")

    root.mainloop()


# ─────────────────────────────────────────────
# MAIN
# ─────────────────────────────────────────────

if __name__ == "__main__":
    run_gui()