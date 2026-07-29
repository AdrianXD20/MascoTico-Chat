import React from 'react';

export const TarjetaProducto = ({ data }) => {
  // Asegurarnos de que data sea un arreglo
  const productos = Array.isArray(data) ? data : [data];

  if (productos.length === 0) return null;

  return (
    <div className="mt-3 bg-white border border-gray-200 rounded-xl shadow-sm p-3 space-y-2 max-w-md">
      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
        🛒 Productos en MascoTico
      </p>
      
      <div className="divide-y divide-gray-100 max-h-60 overflow-y-auto pr-1">
        {productos.map((prod, index) => (
          <div key={index} className="py-2 flex items-center justify-between first:pt-0 last:pb-0">
            <div className="flex flex-col">
              <span className="font-medium text-sm text-gray-800">{prod.nombre}</span>
              <span className="text-xs text-gray-400">{prod.marca || "MascoTico"}</span>
            </div>
            
            <div className="text-right flex flex-col items-end">
              {/* Formateo de precio en pesos mexicanos */}
              <span className="text-sm font-bold text-emerald-600">
                ${Number(prod.precio || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </span>
              {prod.stock && (
                <span className={`text-[10px] font-medium px-1.5 rounded ${
                  Number(prod.stock) > 3 ? "bg-green-50 text-green-600" : "bg-amber-50 text-amber-600"
                }`}>
                  {Number(prod.stock) > 0 ? `${prod.stock} disponibles` : "Sin stock"}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};