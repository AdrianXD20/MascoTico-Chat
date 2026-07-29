# agente_rag.py
"""
Agente especialista en RAG.
Acceso exclusivo a la base de datos vectorial (ChromaDB) + tools informativas.
"""

from pathlib import Path
import ollama
import json

from langchain_chroma import Chroma
from langchain_ollama import OllamaEmbeddings
from rank_bm25 import BM25Okapi
from sentence_transformers import CrossEncoder

from tools import (
    buscar_veterinarios_por_mascota,
    buscar_productos_por_categoria,
    consultar_stock_producto,
    buscar_blogs_por_categoria,
    consultar_servicios_veterinario,
)

MODEL = "qwen2.5:7b"
BASE_DIR = Path(__file__).resolve().parent
CHROMA_PATH = BASE_DIR / "chroma_db"

# ─────────────────────────────────────────────
# Cargar la BD vectorial YA EXISTENTE (no se reconstruye aquí)
# ─────────────────────────────────────────────
embeddings = OllamaEmbeddings(model="nomic-embed-text:latest")
db = Chroma(
    persist_directory=str(CHROMA_PATH),
    embedding_function=embeddings,
    collection_metadata={"hnsw:space": "cosine"}
)

# Cargamos todo el corpus en memoria una sola vez, para poder hacer BM25
_todos_los_docs = db.get()
_corpus_textos = _todos_los_docs["documents"]
_tokenized_corpus = [doc.lower().split() for doc in _corpus_textos]
_bm25 = BM25Okapi(_tokenized_corpus)

# Reranker (se carga una sola vez, pesa ~500MB la primera vez)
_reranker = CrossEncoder('BAAI/bge-reranker-v2-m3')

TOOLS_RAG = [
    {"type": "function", "function": {
        "name": "buscar_veterinarios_por_mascota",
        "description": "Busca veterinarios disponibles según el tipo de mascota que atienden",
        "parameters": {"type": "object", "properties": {
            "tipo_mascota": {"type": "string", "enum": ["Perro", "Gato", "Roedores", "Reptiles"]}
        }, "required": ["tipo_mascota"]}
    }},
    {"type": "function", "function": {
        "name": "buscar_productos_por_categoria",
        "description": "Busca productos disponibles en la tienda según el tipo de mascota",
        "parameters": {"type": "object", "properties": {
            "categoria": {"type": "string", "enum": ["Perro", "Gato", "Roedores", "Reptiles"]}
        }, "required": ["categoria"]}
    }},
    {"type": "function", "function": {
        "name": "consultar_stock_producto",
        "description": "Consulta el stock y precio de un producto específico por nombre",
        "parameters": {"type": "object", "properties": {
            "nombre_producto": {"type": "string"}
        }, "required": ["nombre_producto"]}
    }},
    {"type": "function", "function": {
        "name": "buscar_blogs_por_categoria",
        "description": "Busca blogs informativos por tema",
        "parameters": {"type": "object", "properties": {
            "categoria": {"type": "string", "enum": [
                "Salud y Prevención", "Nutrición y Dieta",
                "Comportamiento y Adiestramiento", "Guía de Cuidados de Exóticos"
            ]}
        }, "required": ["categoria"]}
    }},
    {"type": "function", "function": {
        "name": "consultar_servicios_veterinario",
        "description": "Obtiene los servicios que ofrece un veterinario",
        "parameters": {"type": "object", "properties": {
            "id_veterinario": {"type": "integer"}
        }, "required": ["id_veterinario"]}
    }},
]

AVAILABLE_FUNCTIONS_RAG = {
    "buscar_veterinarios_por_mascota": buscar_veterinarios_por_mascota,
    "buscar_productos_por_categoria":  buscar_productos_por_categoria,
    "consultar_stock_producto":        consultar_stock_producto,
    "buscar_blogs_por_categoria":      buscar_blogs_por_categoria,
    "consultar_servicios_veterinario": consultar_servicios_veterinario,
}


def busqueda_hibrida_rerank(query: str, top_k_inicial: int = 10, top_n_final: int = 3) -> list[str]:
    """
    1. Busca top_k_inicial candidatos combinando vectorial (denso) + BM25 (disperso)
    2. Rerankea con Cross-Encoder y devuelve solo los top_n_final mejores
    """
    # Búsqueda densa (vectorial)
    resultados_densos = db.similarity_search_with_score(query, k=top_k_inicial)
    textos_densos = [doc.page_content for doc, _ in resultados_densos]

    # Búsqueda dispersa (BM25, por palabras clave)
    scores_bm25 = _bm25.get_scores(query.lower().split())
    top_bm25_idx = sorted(range(len(scores_bm25)), key=lambda i: scores_bm25[i], reverse=True)[:top_k_inicial]
    textos_bm25 = [_corpus_textos[i] for i in top_bm25_idx]

    # Fusión simple: unión sin duplicados (RRF simplificado)
    candidatos = list(dict.fromkeys(textos_densos + textos_bm25))  # preserva orden, quita duplicados

    if not candidatos:
        return []

    # Reranking con Cross-Encoder
    pares = [[query, texto] for texto in candidatos]
    scores_rerank = _reranker.predict(pares)
    ordenados = [texto for _, texto in sorted(zip(scores_rerank, candidatos), key=lambda x: x[0], reverse=True)]

    return ordenados[:top_n_final]


import re

def _extraer_tools_de_texto_rag(content: str) -> list[dict] | None:
    """Detecta <tools>JSON</tools> en texto y parsea como tool_calls."""
    if not content:
        return None
    matches = re.findall(r'<tools>\s*(\{.*?\})\s*</tools>', content, re.DOTALL)
    if not matches:
        return None
    tool_calls = []
    for match in matches:
        try:
            parsed = json.loads(match)
            if "name" in parsed:
                tool_calls.append({
                    "function": {
                        "name": parsed["name"],
                        "arguments": parsed.get("arguments", {})
                    }
                })
        except json.JSONDecodeError:
            continue
    return tool_calls if tool_calls else None


def _limpiar_texto_rag(texto: str) -> str:
    """Limpia bloques <tools> del texto del LLM."""
    if not texto:
        return texto
    texto = re.sub(r'<tools>.*?</tools>', '', texto, flags=re.DOTALL)
    return re.sub(r'\n{3,}', '\n\n', texto).strip()


def ejecutar_agente_rag(mensaje_usuario: str, historial: list[dict]) -> tuple[str, str]:
    """
    Ejecuta el agente RAG y devuelve una tupla (respuesta, contexto_recuperado).
    El contexto_recuperado es el texto de los chunks recuperados de ChromaDB,
    útil para debugging y transparencia en la respuesta de la API.
    """
    contexto_chunks = busqueda_hibrida_rerank(mensaje_usuario)
    contexto_texto = "\n\n---\n\n".join(contexto_chunks) if contexto_chunks else "Sin contexto adicional disponible."

    system_prompt = f"""Eres el especialista en información general de MascoTico.
Usa el siguiente contexto recuperado de la base de conocimiento para responder con precisión:

CONTEXTO RECUPERADO:
{contexto_texto}

Reglas:
- Si el contexto no tiene la respuesta, dilo honestamente, no inventes.
- También puedes usar herramientas para consultar veterinarios, productos, blogs o servicios en tiempo real.
- Responde siempre en español, de forma clara y amigable.
"""

    messages = [{"role": "system", "content": system_prompt}] + historial + [
        {"role": "user", "content": mensaje_usuario}
    ]

    response = ollama.chat(model=MODEL, messages=messages, tools=TOOLS_RAG)
    message = response["message"]

    tool_calls = message.get("tool_calls")

    # Qwen a veces escupe <tools>JSON</tools> como texto
    if not tool_calls:
        text_tools = _extraer_tools_de_texto_rag(message.get("content") or "")
        if text_tools:
            print(f"[AgenteRAG] Detectado tool call en texto, parseando manualmente...")
            tool_calls = text_tools
            message["content"] = _limpiar_texto_rag(message.get("content") or "")

    if not tool_calls:
        return _limpiar_texto_rag(message.get("content", "")), contexto_texto

    messages.append({"role": "assistant", "content": message.get("content", ""), "tool_calls": tool_calls})
    for tool_call in tool_calls:
        fn_name = tool_call["function"]["name"]
        arguments = tool_call["function"]["arguments"]
        try:
            result = AVAILABLE_FUNCTIONS_RAG[fn_name](**arguments)
        except Exception as exc:
            result = {"error": str(exc)}
        messages.append({"role": "tool", "content": json.dumps(result, ensure_ascii=False, default=str)})

    final = ollama.chat(model=MODEL, messages=messages, tools=TOOLS_RAG)
    return _limpiar_texto_rag(final["message"].get("content", "")), contexto_texto