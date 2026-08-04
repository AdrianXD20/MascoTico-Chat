"""
Guard: sistema de defensa multicapa contra prompt injection.
- Capa 1: Sanitización de entrada (detecta y neutraliza patrones de inyección + moderación de contenido)
- Capa 2: Validación de herramientas (verifica parámetros antes de ejecutar)
- Capa 3: Guard de salida (detecta fuga de system prompt)
"""

import re

# ─────────────────────────────────────────────
# CAPA 1: DETECCIÓN DE INYECCIÓN EN ENTRADA
# ─────────────────────────────────────────────

INJECTION_PATTERNS = [
    # Cambio de rol / personalidad
    r"(?i)(?:a partir de ahora|de ahora en adelante|actúa\s*como|eres\s*(?:ahora|a partir de))",
    r"(?i)(?:ignora\s*(?:las\s*)?(?:instrucciones?|reglas?|órdenes?|comandos?|directivas?|prompt))",
    r"(?i)(?:olvida\s*(?:las\s*)?(?:instrucciones?|reglas?|todo|el\s*prompt))",
    r"(?i)(?:no\s*(?:sigas|obedezcas|hagas\s*caso)\s*(?:las\s*)?(?:instrucciones?|reglas?))",
    r"(?i)(?:nueva\s*(?:instrucción|regla|orden|directiva|tarea))",
    # Extracción de system prompt
    r"(?i)(?:muestra|revela|dime|imprime|muéstrame)\s*(?:tu\s*)?(?:system\s*)?(?:prompt|instrucciones?|reglas?)",
    r"(?i)(?:cómo\s*funcionas|cuál\s*es\s*tu\s*(?:prompt|instrucción))",
    r"(?i)(?:dame\s*tu\s*(?:prompt|instrucciones?)|quiero\s*ver\s*tu\s*código)",
    # Repetición / token smuggling
    r"(?i)(?:repite\s*(?:todo\s*lo\s*)?(?:que\s*)?(?:dije|escribí|dijiste))",
    r"(?i)(?:dilo\s*en\s*tono\s*inverso|al\s*revés|al\s*contrario)",
    # Simulación /角色play malicioso
    r"(?i)(?:eres\s*(?:ahora|a\s*partir\s*de\s*ahora)\s*(?:un|otro|una|el)\s*(?:asistente|bot|ia|sistema|hacker))",
    r"(?i)(?:finge\s*ser|pretende\s*ser|simula\s*ser|actúa\s*como\s*si\s*fueras)",
    # Manipulación de tools
    r"(?i)(?:ejecuta\s*(?:la\s*)?(?:función|herramienta|tool|comando)\s*(?:sin|aunque))",
    r"(?i)(?:llama\s*a\s*(?:la\s*)?(?:función|herramienta)\s*(?:sin|con\s*parámetros?\s*inválidos?))",
    # Bypass de seguridad
    r"(?i)(?:bypassea|bypasa|salta\s*la\s*seguridad|ignora\s*la\s*seguridad)",
    r"(?i)(?:modo\s*(?:debug|desarrollador|admin|root|superusuario|seguro))",
    # Instrucciones contradictorias
    r"(?i)(?:aunque\s*te\s*(?:dije|haya\s*dicho|digan)\s*lo\s*contrario)",
    r"(?i)(?:esto\s*es\s*una\s*(?:prueba|simulación|emergencia|orden\s*superior))",
    # Extracción del contexto recuperado / base de conocimiento
    r"(?i)(?:imprime|muestra|repite|dime|escribe|devolv[eé]|copia|le[eé])\s*(?:textualmente|literalmente|completo|completa)?\s*(?:el\s+|todo\s+el\s+)?(?:contenido\s+(?:del\s+|de\s+tu\s+|que\s+recibiste\s+del\s+)?)?(?:contexto\s+(?:rag\s+)?|base\s+de\s+conocimiento|documento\s+interno)",
    r"(?i)(?:contexto\s+(?:rag|recuperado)|contexto\s+que\s+recibiste|contenido\s+de\s+la\s+base\s+de\s+conocimiento|qu[eé]\s+contexto\s+(?:recibiste|tienes))",
]

INJECTION_PATTERN_COMPILED = [re.compile(p) for p in INJECTION_PATTERNS]


def detectar_inyeccion(texto: str) -> tuple[bool, list[str]]:
    """Detecta si un texto contiene patrones de prompt injection.
    Retorna (es_inocuo: bool, patrones_encontrados: list[str])."""
    if not texto:
        return True, []

    encontrados = []
    for i, pattern in enumerate(INJECTION_PATTERN_COMPILED):
        if pattern.search(texto):
            encontrados.append(INJECTION_PATTERNS[i])

    return len(encontrados) == 0, encontrados


def sanitizar_mensaje(texto: str) -> str:
    """Limpia el mensaje del usuario eliminando o neutralizando
    patrones de inyección conocidos."""
    if not texto:
        return texto

    # Reemplazar patrones de inyección con versiones neutralizadas
    # (no eliminamos completamente para no romper la conversación)
    for pattern in INJECTION_PATTERN_COMPILED:
        texto = pattern.sub("[mensaje filtrado por seguridad]", texto)

    return texto


# ─────────────────────────────────────────────
# CAPA 2: VALIDACIÓN DE HERRAMIENTAS
# ─────────────────────────────────────────────

TOOL_PARAM_LIMITS = {
    "agendar_cita": {
        "id_usuario": {"type": int, "min": 1},
        "id_veterinario": {"type": int, "min": 1},
        "tipo_mascota": {"type": str, "options": ["Perro", "Gato", "Roedores", "Reptiles"]},
        "razon": {"type": str, "max_length": 200},
        "hora": {"type": str, "pattern": r"^\d{2}:\d{2}$"},
    },
    "realizar_compra": {
        "id_usuario": {"type": int, "min": 1},
        "items": {"type": list, "max_items": 50, "item_schema": {
            "id_producto": {"type": int, "min": 1},
            "cantidad": {"type": int, "min": 1, "max": 100},
        }},
    },
    "buscar_veterinarios_filtrados": {
        "tipo_mascota": {"type": str, "options": ["Perro", "Gato", "Roedores", "Reptiles"]},
        "hora": {"type": str, "pattern": r"^\d{2}:\d{2}$"},
    },
    "buscar_veterinarios_por_mascota": {
        "tipo_mascota": {"type": str, "options": ["Perro", "Gato", "Roedores", "Reptiles"]},
    },
    "buscar_productos_por_categoria": {
        "categoria": {"type": str, "options": ["Perro", "Gato", "Roedores", "Reptiles"]},
    },
    "buscar_blogs_por_categoria": {
        "categoria": {"type": str, "options": [
            "Salud y Prevención", "Nutrición y Dieta",
            "Comportamiento y Adiestramiento", "Guía de Cuidados de Exóticos"
        ]},
    },
    "consultar_stock_producto": {
        "nombre_producto": {"type": str, "max_length": 100},
    },
    "consultar_servicios_veterinario": {
        "id_veterinario": {"type": int, "min": 1},
    },
    "consultar_citas_veterinario": {
        "id_veterinario": {"type": int, "min": 1},
    },
    "consultar_ventas_usuario": {
        "id_usuario": {"type": int, "min": 1},
    },
}


def validar_tool_call(fn_name: str, arguments: dict) -> tuple[bool, str | None]:
    """Valida que los parámetros de una tool call sean razonables.
    Retorna (es_válido: bool, error_msg: str | None)."""
    if fn_name not in TOOL_PARAM_LIMITS:
        return True, None

    limits = TOOL_PARAM_LIMITS[fn_name]

    # Verificar que no haya parámetros extraños
    for key in arguments:
        if key not in limits and key != "name":
            return False, f"Parámetro '{key}' no esperado para {fn_name}"

    for param_name, rules in limits.items():
        value = arguments.get(param_name)

        # Parámetros requeridos implícitamente por la tool
        if value is None and rules.get("required", True):
            continue  # La tool misma validará

        if value is not None:
            # Validar tipo
            expected_type = rules.get("type")
            if expected_type and not isinstance(value, expected_type):
                # Permitir conversión int→str para ciertos casos
                if expected_type == str and isinstance(value, (int, float)):
                    arguments[param_name] = str(value)
                else:
                    return False, f"'{param_name}' debe ser {expected_type.__name__}, no {type(value).__name__}"

            # Validar opciones fijas
            options = rules.get("options")
            if options and isinstance(value, str) and value not in options:
                return False, f"'{param_name}='{value}' no es válido. Opciones: {', '.join(options)}"

            # Validar patrón regex
            pattern = rules.get("pattern")
            if pattern and isinstance(value, str) and not re.match(pattern, value):
                return False, f"'{param_name}='{value}' no tiene el formato esperado"

            # Validar longitud máxima
            max_len = rules.get("max_length")
            if max_len and isinstance(value, str) and len(value) > max_len:
                return False, f"'{param_name}' demasiado largo ({len(value)} > {max_len})"

            # Validar valor mínimo
            min_val = rules.get("min")
            if min_val is not None and isinstance(value, (int, float)) and value < min_val:
                return False, f"'{param_name}={value}' es muy pequeño (mínimo {min_val})"

            # Validar valor máximo
            max_val = rules.get("max")
            if max_val is not None and isinstance(value, (int, float)) and value > max_val:
                return False, f"'{param_name}={value}' es muy grande (máximo {max_val})"

            # Validar items en listas
            max_items = rules.get("max_items")
            if max_items and isinstance(value, list) and len(value) > max_items:
                return False, f"Demasiados items ({len(value)} > {max_items})"

            # Validar schema de items
            item_schema = rules.get("item_schema")
            if item_schema and isinstance(value, list):
                for i, item in enumerate(value):
                    for item_param, item_rules in item_schema.items():
                        item_val = item.get(item_param)
                        if item_val is not None:
                            if isinstance(item_rules.get("type"), type) and not isinstance(item_val, item_rules["type"]):
                                return False, f"Item[{i}].{item_param} debe ser {item_rules['type'].__name__}"
                            item_min = item_rules.get("min")
                            if item_min is not None and isinstance(item_val, (int, float)) and item_val < item_min:
                                return False, f"Item[{i}].{item_param}={item_val} es muy pequeño"
                            item_max = item_rules.get("max")
                            if item_max is not None and isinstance(item_val, (int, float)) and item_val > item_max:
                                return False, f"Item[{i}].{item_param}={item_val} es muy grande"

    return True, None


# ─────────────────────────────────────────────
# CAPA 3: GUARD DE SALIDA
# ─────────────────────────────────────────────

SYSTEM_PROMPT_LEAK_PATTERNS = [
    r"(?i)(?:system\s*prompt|instrucciones?\s*(?:del\s*)?sistema|reglas?\s*internas)",
    r"(?i)(?:mi\s*(?:system\s*)?prompt\s*(?:es|dice|contiene)?)",
    r"(?i)(?:me\s*programaron\s*(?:para|como)|fui\s*(?:diseñado|programado)\s*(?:para|como))",
    r"(?i)(?:contexto\s*de\s*sesión|id_del_usuario\s*=|user_id\s*=)",
    r"(?i)(?:CONTEXTO\s+DE\s+SESIÓN|MEMORIA_HERRAMIENTAS)",
    # Fragmentos textuales del system prompt interno (no aparecen en respuestas legítimas)
    r"(?i)(?:eres\s+un\s+asistente\s+de\s+soporte\s+para\s+masco)",
    r"(?i)(?:regla\s+de\s+distinción\s+de\s+herramientas)",
    r"(?i)(?:separación\s+estricta\s+entre\s+compras\s+y\s+citas)",
    r"(?i)(?:regla\s+de\s+validación\s+horaria\s+estricta)",
    r"(?i)(?:prioridad\s+de\s+herramientas)",
    r"(?i)(?:regla\s+de\s+negociación\s+horaria)",
    r"(?i)(?:reglas\s+de\s+formato\s+críticas)",
    r"(?i)(?:la\s+fecha\s+de\s+hoy\s+es)",
    r"(?i)(?:usuario\s+autenticado\s+que\s+está\s+chateando)",
    r"(?i)(?:respuesta\s+del\s+modelo\s+contiene\s+fugas)",
    r"(?i)(?:no\s+usas\s+la\s+etiqueta\s+<think>)",
    r"(?i)(?:asistente\s+de\s+masco\s*)?:\s*(?:reglas\s+de\s+moneda)",
    # Nombres de funciones internas (nunca deben aparecer en respuestas legítimas)
    r"(?i)(?:agendar_cita|realizar_compra|buscar_veterinarios_filtrados|buscar_veterinarios_por_mascota)",
    r"(?i)(?:consultar_citas_veterinario|consultar_ventas_usuario|buscar_productos_por_categoria|consultar_stock_producto|buscar_blogs_por_categoria|consultar_servicios_veterinario)",
    # Reglas meta / notas de seguridad del system prompt
    r"(?i)(?:function\s*calling|llamad[ao]\s*de\s*funci[oó]n)",
    r"(?i)(?:no\s+ejecutar\s+herramientas|par[aá]metros\s+que\s+no\s+hayan\s+sido\s+solicitados)",
    r"(?i)(?:etiquetas?\s+xml\s+de\s+renderizado|regla\s+de\s+desambiguaci[oó]n)",
    r"(?i)(?:memoria\s+interna\s+para\s+agendamiento)",
    r"(?i)(?:contexto\s+de\s+s[ií]on\s+actual|id_usuario\s+del\s+contexto\s+de\s+s[ií]on)",
    r"(?i)(?:separaci[oó]n\s+de\s+instrucciones|jerarqu[ií]a\s+de\s+prioridad)",
]

SYSTEM_PROMPT_LEAK_COMPILED = [re.compile(p) for p in SYSTEM_PROMPT_LEAK_PATTERNS]


# ─────────────────────────────────────────────
# MODERACIÓN DE CONTENIDO (ofensivo/peligroso)
# ─────────────────────────────────────────────

MODERACION_BLOQUEOS = [
    (r"(?i)(?:suicid[io]|matar[ae]?|morir|muerte)", "contenido violento/autolesión"),
    (r"(?i)(?:droga[ds]?|narcótico[as]?|cocaína|marihuana|weed|hookah|vape[ea]r?)", "contenido sobre drogas"),
    (r"(?i)(?:arma[ds]?|bomba[ds]?|explosivo[as]?|pistola|rifle|cuchillo[as]?)", "contenido sobre armas"),
    (r"(?i)(?:hackea[rt]?|virus|malware|ransomware|phishing|roba[rt]?\s*(?:cuenta|contraseña))", "contenido malicioso/hacking"),
    (r"(?i)(?:porno?|xxx|contenido\s*para\s*adultos)", "contenido para adultos"),
    (r"(?i)(?:put[ao]|pendej[ao]|ching[au]|cabr[óo]n|verga[ds]?|mierda[ds]?|cul[ao]|pito[as]?|chup[ae])", "lenguaje ofensivo"),
]


def moderar_contenido(texto: str) -> tuple[bool, str | None]:
    """Modera el contenido del mensaje del usuario.
    Retorna (es_aceptable: bool, razon: str | None)."""
    if not texto:
        return True, None
    for pattern, razon in MODERACION_BLOQUEOS:
        if re.search(pattern, texto):
            return False, razon
    return True, None


def detectar_leak_system_prompt(respuesta: str) -> bool:
    """Detecta si la respuesta del modelo contiene partes del system prompt."""
    if not respuesta:
        return False
    for pattern in SYSTEM_PROMPT_LEAK_COMPILED:
        if pattern.search(respuesta):
            return True
    return False


def sanitizar_respuesta(respuesta: str) -> str:
    """Si la respuesta del modelo contiene fugas del system prompt,
    la reemplaza completa por un mensaje seguro (no se filtra nada)."""
    if not respuesta:
        return respuesta
    if detectar_leak_system_prompt(respuesta):
        return ("Lo siento, no puedo compartir información interna del sistema. "
                "¿En qué más puedo ayudarte con MascoTico?")
    return respuesta
