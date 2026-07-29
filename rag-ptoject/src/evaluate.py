from datasets import Dataset

from ragas import evaluate
from ragas.metrics import (
    faithfulness,
    answer_relevancy,
)

from langchain_chroma import Chroma
from langchain_ollama import OllamaEmbeddings
from langchain_ollama import OllamaLLM

# ==========================================
# 1. EMBEDDINGS
# ==========================================

embeddings = OllamaEmbeddings(
    model="nomic-embed-text:latest"
)

# ==========================================
# 2. CHROMADB
# ==========================================

db = Chroma(
    persist_directory="chroma_db",
    embedding_function=embeddings
)

# ==========================================
# 3. LLM LOCAL
# ==========================================
llm = OllamaLLM(
    model="llama3.2:3b",
    num_predict=256,
    temperature=0,
    timeout=300
)

# ==========================================
# 4. PREGUNTA
# ==========================================

question = "¿Qué son los datos estructurados?"

# ==========================================
# 5. RETRIEVAL
# ==========================================

results = db.similarity_search(question, k=3)

contexts = [r.page_content for r in results]

context_text = "\n".join(contexts)

# ==========================================
# 6. PROMPT
# ==========================================

prompt = f"""
Responde SOLO usando el contexto.

Contexto:
{context_text}

Pregunta:
{question}
"""

# ==========================================
# 7. RESPUESTA
# ==========================================

answer = llm.invoke(prompt)

print("\n================================")
print("RESPUESTA GENERADA")
print("================================\n")

print(answer)

# ==========================================
# 8. DATASET RAGAS
# ==========================================

data = {
    "question": [question],
    "answer": [answer],
    "contexts": [contexts],
    "ground_truth": [
        "Los datos estructurados son datos organizados en un formato fijo y consistente."
    ]
}

dataset = Dataset.from_dict(data)

# ==========================================
# 9. EVALUACIÓN
# ==========================================

print("\nEvaluando métricas...\n")

result = evaluate(
    dataset=dataset,
    metrics=[
        faithfulness,
        answer_relevancy
    ],
    llm=llm,
    embeddings=embeddings
)

# ==========================================
# 10. RESULTADOS
# ==========================================

print("\n================================")
print("MÉTRICAS RAGAS")
print("================================\n")

print(result)