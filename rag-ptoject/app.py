from langchain_community.document_loaders import PyPDFLoader

loader = PyPDFLoader("documentos/archivo.pdf")
docs = loader.load()

print(docs)