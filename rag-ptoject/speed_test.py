import ollama
import time

try:
    print("Enviando 'hola' a Ollama...")
    t0 = time.time()
    res = ollama.chat(model='qwen2.5:7b', messages=[{'role': 'user', 'content': 'hola'}])
    elapsed = time.time() - t0
    print(f"Ollama respondió en {elapsed:.2f} segundos.")
    print("Respuesta:", res["message"]["content"])
except Exception as e:
    print(f"Error: {e}")
