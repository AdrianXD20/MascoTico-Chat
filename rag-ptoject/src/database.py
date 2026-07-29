import mysql.connector
from mysql.connector import Error

def get_connection():
    """
    Crea y retorna una conexión a la base de datos MySQL de MascoTico.
    Lanza una excepción si no puede conectarse.
    """
    try:
        connection = mysql.connector.connect(
            host="bt2tz6y6owhhirywgpen-mysql.services.clever-cloud.com",
            port=3306,
            user="unuccu6nnregqdi0",
            password="dnIp2ppjpC0QHp6AuyvM",
            database="bt2tz6y6owhhirywgpen",
            charset="utf8mb4",
            connection_timeout=10,   # 👈 nuevo: falla en 10s en vez de colgarse
        )
        return connection
    except Error as e:
        raise ConnectionError(f"Error conectando a la base de datos: {e}")