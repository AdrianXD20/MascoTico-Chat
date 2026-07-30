import os
import mysql.connector
from mysql.connector import Error

def get_connection():
    """
    Crea y retorna una conexión a la base de datos MySQL de MascoTico.
    Usa variables de entorno para las credenciales.
    """
    try:
        connection = mysql.connector.connect(
            host=os.getenv("DB_HOST", "bt2tz6y6owhhirywgpen-mysql.services.clever-cloud.com"),
            port=int(os.getenv("DB_PORT", "3306")),
            user=os.getenv("DB_USER", "unuccu6nnregqdi0"),
            password=os.getenv("DB_PASSWORD", "dnIp2ppjpC0QHp6AuyvM"),
            database=os.getenv("DB_NAME", "bt2tz6y6owhhirywgpen"),
            charset="utf8mb4",
            connection_timeout=10,
        )
        return connection
    except Error as e:
        raise ConnectionError(f"Error conectando a la base de datos: {e}")