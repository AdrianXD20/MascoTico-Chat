from langchain_ollama import OllamaEmbeddings, OllamaLLM
from langchain_chroma import Chroma


def build_prompt(context: str, query: str) -> str:
    return f"""Eres un asistente de soporte para MascoTico, una plataforma para el cuidado de mascotas.

Responde usando ÚNICAMENTE la información del contexto proporcionado.
Si la respuesta no está en el contexto, responde exactamente:
"No tengo información sobre eso, te recomiendo contactar a soporte."
No agregues información que no esté en el contexto. No supongas ni inventes.

Contexto:
{context}

Pregunta: {query}

Respuesta:"""


def retrieve_context(db, query: str) -> tuple[str, list]:
    # Buscar chunks con score de relevancia
    results_with_scores = db.similarity_search_with_relevance_scores(query, k=6)

    # Filtrar chunks poco relevantes
    filtered = [
        (doc, score)
        for doc, score in results_with_scores
        if score >= 0.4
    ]

    # Si ningún chunk supera el umbral, usar los mejores 3 sin filtrar
    if not filtered:
        print("⚠️  Ningún chunk superó el umbral, usando los mejores disponibles\n")
        filtered = results_with_scores[:3]

    return filtered


def main() -> None:
    # Embeddings
    embeddings = OllamaEmbeddings(model="nomic-embed-text")

    # Cargar base vectorial
    db = Chroma(
    persist_directory="chroma_db",
    embedding_function=embeddings,
    collection_metadata={"hnsw:space": "cosine"}  # ← esto
)

    # Pregunta del usuario
    query = input("Haz una pregunta: ")

    # Retrieval con scores
    results = retrieve_context(db, query)

    # Mostrar contexto recuperado
    print("\n=== CONTEXTO RECUPERADO ===\n")
    for doc, score in results:
        print(f"[Score: {score:.2f} | Fuente: {doc.metadata.get('source', 'desconocido')}]")
        print(doc.page_content)
        print("\n-------------------\n")

    # Construir contexto
    context = "\n\n".join([doc.page_content for doc, score in results])

    # Construir prompt
    prompt = build_prompt(context, query)

    # LLM
    llm = OllamaLLM(
        model="llama3.2:3b",
        temperature=0.1,    # Muy bajo para que no invente
        num_ctx=4096,
    )

    # Generar respuesta
    response = llm.invoke(prompt)

    print("\n=== RESPUESTA FINAL ===\n")
    print(response)


if __name__ == "__main__":
    main()