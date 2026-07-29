import sys
import os
# Add project src directory to Python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), 'src')))
from tools import realizar_compra

if __name__ == '__main__':
    # Ajusta IDs según tu BD; se asume que el usuario 4 y productos 1 y 2 existen
    result = realizar_compra(
        id_usuario=4,
        items=[
            {"id_producto": 1, "cantidad": 1},
            {"id_producto": 2, "cantidad": 2},
        ],
    )
    print('Resultado de la compra:', result)
