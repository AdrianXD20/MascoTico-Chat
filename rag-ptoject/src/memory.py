"""
Gestión de memoria persistente para el agente MascoTico.
Usa SQLite para guardar el historial de conversaciones por session_id y user_id.
La base de datos se crea automáticamente en la primera ejecución.
"""

import sqlite3
import uuid
import json
from datetime import datetime
from pathlib import Path

# ─────────────────────────────────────────────
# CONFIGURACIÓN
# ─────────────────────────────────────────────

DB_PATH = Path(__file__).parent / "sessions" / "sessions.db"

# Límite de mensajes por conversación antes de aplicar ventana deslizante
MAX_MESSAGES = 12


# ─────────────────────────────────────────────
# INICIALIZACIÓN DE LA BASE DE DATOS
# ─────────────────────────────────────────────

def init_db() -> None:
    """
    Crea la base de datos SQLite y las tablas necesarias si no existen.
    Se llama automáticamente al importar el módulo.
    """
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    with sqlite3.connect(DB_PATH, timeout=10) as conn:
        # Configurar para mejor concurrencia con múltiples conexiones
        conn.execute("PRAGMA journal_mode=WAL")
        conn.execute("PRAGMA synchronous=NORMAL")
        conn.execute("PRAGMA cache_size=5000")
        
        conn.execute("""
            CREATE TABLE IF NOT EXISTS conversaciones (
                conversation_id TEXT PRIMARY KEY,
                user_id         INTEGER NOT NULL,
                created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        """)
        conn.execute("""
            CREATE TABLE IF NOT EXISTS historial (
                id              INTEGER PRIMARY KEY AUTOINCREMENT,
                conversation_id TEXT NOT NULL,
                user_id         INTEGER NOT NULL,
                role            TEXT NOT NULL,
                content         TEXT NOT NULL,
                timestamp       DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (conversation_id)
                    REFERENCES conversaciones(conversation_id)
            )
        """)
        conn.execute("""
            CREATE INDEX IF NOT EXISTS idx_conv_id
            ON historial(conversation_id)
        """)
        conn.commit()
    print(f"[Memory] Base de datos inicializada en: {DB_PATH}")


# ─────────────────────────────────────────────
# GESTIÓN DE SESIONES
# ─────────────────────────────────────────────

def nueva_conversacion(user_id: int) -> str:
    """
    Genera un nuevo conversation_id UUID y lo registra en la BD.
    Retorna el conversation_id generado.

    Args:
        user_id: ID del usuario autenticado en MascoTico
    """
    conversation_id = str(uuid.uuid4())
    with sqlite3.connect(DB_PATH, timeout=10) as conn:
        conn.execute(
            "INSERT INTO conversaciones (conversation_id, user_id) VALUES (?, ?)",
            (conversation_id, user_id)
        )
        conn.commit()
    print(f"[Memory] Nueva conversación creada: {conversation_id} | user_id: {user_id}")
    return conversation_id


def conversacion_existe(conversation_id: str, user_id: int) -> bool:
    """
    Verifica que el conversation_id exista y pertenezca al user_id indicado.
    Previene que un usuario acceda al historial de otro.

    Args:
        conversation_id: UUID de la conversación
        user_id: ID del usuario que hace la petición
    """
    with sqlite3.connect(DB_PATH, timeout=10) as conn:
        row = conn.execute(
            "SELECT 1 FROM conversaciones WHERE conversation_id = ? AND user_id = ?",
            (conversation_id, user_id)
        ).fetchone()
    return row is not None


# ─────────────────────────────────────────────
# HISTORIAL DE MENSAJES
# ─────────────────────────────────────────────

def guardar_mensaje(conversation_id: str, user_id: int, role: str, content: str, tool_calls=None) -> None:
    """
    Guarda un mensaje en el historial de la conversación.
    Si el contenido es un dict o list (resultado de tool), lo serializa a JSON.

    Args:
        conversation_id: UUID de la conversación
        user_id: ID del usuario
        role: Rol del mensaje ('user', 'assistant', 'tool', 'system')
        content: Contenido del mensaje
    """
    if isinstance(content, (dict, list)):
        content = json.dumps(content, ensure_ascii=False)

    if tool_calls is not None:
        # Función interna para convertir objetos ToolCall a dicts serializables
        def clean_tool_calls(tc_list):
            cleaned = []
            for tc in tc_list:
                # Si el objeto tiene un método model_dump (Pydantic) o es un objeto, lo convertimos
                if hasattr(tc, 'model_dump'):
                    cleaned.append(tc.model_dump())
                elif hasattr(tc, '__dict__'):
                    cleaned.append(vars(tc))
                else:
                    # Si ya es un dict, lo dejamos tal cual
                    cleaned.append(tc)
            return cleaned

        payload = json.dumps({
            "content": content, 
            "tool_calls": clean_tool_calls(tool_calls)
        }, ensure_ascii=False)
        content = payload

    with sqlite3.connect(DB_PATH, timeout=10) as conn:
        conn.execute(
            """INSERT INTO historial (conversation_id, user_id, role, content)
               VALUES (?, ?, ?, ?)""",
            (conversation_id, user_id, role, content)
        )
        conn.execute(
            "UPDATE conversaciones SET updated_at = ? WHERE conversation_id = ?",
            (datetime.now().isoformat(), conversation_id)
        )
        conn.commit()


def obtener_historial(conversation_id: str) -> list[dict]:
    with sqlite3.connect(DB_PATH, timeout=10) as conn:
        rows = conn.execute(
            """SELECT role, content FROM historial
               WHERE conversation_id = ?
               ORDER BY timestamp ASC""",
            (conversation_id,)
        ).fetchall()

    mensajes = []
    for role, content in rows:
        if role == "assistant" and content.startswith('{"content"'):
            try:
                parsed = json.loads(content)
                mensajes.append({
                    "role": "assistant",
                    "content": parsed.get("content", ""),
                    "tool_calls": parsed.get("tool_calls"),
                })
                continue
            except json.JSONDecodeError:
                pass
        mensajes.append({"role": role, "content": content})

    if len(mensajes) > MAX_MESSAGES + 1:
        system_prompt = mensajes[0]
        ultimos_mensajes = mensajes[-(MAX_MESSAGES):]
        mensajes = [system_prompt] + ultimos_mensajes
        print(f"[Memory] Ventana deslizante aplicada: {len(mensajes)} mensajes enviados al LLM")

    return mensajes


def listar_conversaciones(user_id: int) -> list[dict]:
    """
    Lista todas las conversaciones de un usuario ordenadas por última actividad.

    Args:
        user_id: ID del usuario
    """
    with sqlite3.connect(DB_PATH, timeout=10) as conn:
        rows = conn.execute(
            """SELECT conversation_id, created_at, updated_at
               FROM conversaciones
               WHERE user_id = ?
               ORDER BY updated_at DESC""",
            (user_id,)
        ).fetchall()

    return [
        {
            "conversation_id": row[0],
            "created_at":      row[1],
            "updated_at":      row[2]
        }
        for row in rows
    ]


def eliminar_conversacion(conversation_id: str, user_id: int) -> bool:
    """
    Elimina una conversación y su historial completo.
    Verifica que pertenezca al user_id antes de borrar.

    Args:
        conversation_id: UUID de la conversación a eliminar
        user_id: ID del usuario dueño de la conversación
    """
    if not conversacion_existe(conversation_id, user_id):
        return False

    with sqlite3.connect(DB_PATH, timeout=10) as conn:
        conn.execute(
            "DELETE FROM historial WHERE conversation_id = ?",
            (conversation_id,)
        )
        conn.execute(
            "DELETE FROM conversaciones WHERE conversation_id = ?",
            (conversation_id,)
        )
        conn.commit()
    print(f"[Memory] Conversación eliminada: {conversation_id}")
    return True


# Inicializar BD al importar el módulo
init_db()