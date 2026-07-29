from langchain_community.document_loaders import TextLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.embeddings import OllamaEmbeddings
from langchain_community.vectorstores import Chroma

import os
from pathlib import Path

# ── Rutas robustas: siempre apuntan a la ubicación real del archivo,
#    sin importar desde dónde ejecutes el script ──
BASE_DIR = Path(__file__).resolve().parent          # rag-ptoject/src
PROJECT_ROOT = BASE_DIR.parent                        # rag-ptoject

DATA_PATH = PROJECT_ROOT / "knowledge_base"
CHROMA_PATH = BASE_DIR / "chroma_db"

# Lista documentos
documents = []

# Leer TODOS los .md
for filename in os.listdir(DATA_PATH):

    if filename.endswith(".md"):

        file_path = DATA_PATH / filename

        loader = TextLoader(
            str(file_path),
            encoding="utf-8"
        )

        docs = loader.load()

        documents.extend(docs)

        print(f"Cargado: {filename}")

# Chunking
splitter = RecursiveCharacterTextSplitter(
    chunk_size=500,
    chunk_overlap=100
)

chunks = splitter.split_documents(documents)

print(f"\nChunks creados: {len(chunks)}")

# Embeddings
embeddings = OllamaEmbeddings(
    model="nomic-embed-text:latest"
)

# Crear ChromaDB
db = Chroma.from_documents(
    documents=chunks,
    embedding=embeddings,
    persist_directory=str(CHROMA_PATH),
    collection_metadata={"hnsw:space": "cosine"}
)

db.persist()

print("\nBase vectorial creada correctamente")