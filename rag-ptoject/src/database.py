import os
from pathlib import Path
import mysql.connector
from mysql.connector import Error

def _load_local_env():
    env_file = Path(__file__).resolve().parents[1] / ".env"
    if not env_file.exists():
        return
    for line in env_file.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if line and not line.startswith("#") and "=" in line:
            key, _, value = line.partition("=")
            os.environ.setdefault(key.strip(), value.strip())

def get_connection():
    """
    Crea y retorna una conexión a la base de datos MySQL de MascoTico.
    Usa variables de entorno para las credenciales.
    """
    _load_local_env()
    try:
        connection = mysql.connector.connect(
            host=os.getenv("DB_HOST", ""),
            port=int(os.getenv("DB_PORT", "3306")),
            user=os.getenv("DB_USER", ""),
            password=os.getenv("DB_PASSWORD", ""),
            database=os.getenv("DB_NAME", ""),
            charset="utf8mb4",
            connection_timeout=10,
        )
        return connection
    except Error as e:
        raise ConnectionError(f"Error conectando a la base de datos: {e}")