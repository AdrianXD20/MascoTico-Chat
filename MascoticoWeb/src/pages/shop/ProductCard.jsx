import React, { useContext } from 'react';
import { FiPlus } from "react-icons/fi";
import Rating from '../../components/Rating';
import { CartContext } from '../../context/CartContext';
import { getImgUrl } from '../../utils/getImgUrl';

const ProductCard = ({ product }) => {
  const { addToCart } = useContext(CartContext);

  // Mapeamos dinámicamente si el backend responde con 'imagen' o 'imageUrl'
  const rutaImagen = product.imagen || product.imageUrl;
  const tieneImagen = rutaImagen && rutaImagen.trim() !== "";

  return (
    <div className="max-w-xs w-full bg-white dark:bg-black shadow-md rounded-lg overflow-hidden flex flex-col mx-auto border border-gray-100">
      <div className="h-48 bg-gray-50 dark:bg-gray-800 flex flex-col items-center justify-center p-4 relative">
        {tieneImagen ? (
          <img
            src={rutaImagen.startsWith('http') ? rutaImagen : getImgUrl(`${rutaImagen}`)}
            alt={product.nombre}
            className="h-full w-full object-contain"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}

        {/* Fallback idéntico al diseño proporcionado */}
        <div 
          className="flex flex-col items-center justify-center text-gray-400 text-center select-none"
          style={{ display: tieneImagen ? 'none' : 'flex' }}
        >
          <svg className="w-12 h-12 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
          </svg>
          <span className="text-[10px] font-bold uppercase tracking-wider">Image Not Found</span>
        </div>
      </div>

      <div className="p-6 flex flex-col justify-between flex-grow">
        <h4 className="text-sm text-gray-500 dark:text-gray-400 mb-1">Categoría: {product.categoria || product.category || "General"}</h4>
        <h3 className="font-semibold text-lg dark:text-white mb-2">{product.nombre || product.name}</h3>
        <Rating rating={product.rating || 5} />

        <div className="mt-4 flex justify-between items-center">
          <p className="text-gray-700 dark:text-white font-bold text-lg">
            ${(product.precio ?? product.price ?? 0).toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <button
            className="bg-secondary p-3 rounded-full text-white hover:bg-primary transition-colors"
            onClick={() => addToCart(product)}
          >
            <FiPlus />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;