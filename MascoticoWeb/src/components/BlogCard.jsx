import React from 'react';
import { FaUser } from "react-icons/fa";

const BlogCards = ({ blogs }) => {
  // Validación por si el API tarda o devuelve un arreglo vacío
  if (!blogs || blogs.length === 0) {
    return <p className="text-gray-400 italic text-center py-10">No se encontraron artículos en esta sección.</p>;
  }

  return (
    <div className='grid md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-8'>
      {blogs.map((blog) => {
        // Validamos si tiene un string válido de imagen
        const tieneImagen = blog.imagen && blog.imagen.trim() !== "";

        return (
          <a 
            href={`blogs/${blog.id}`} 
            key={blog.id} 
            className="block p-5 shadow-lg rounded-xl bg-white border border-gray-50 hover:shadow-xl transition-shadow cursor-pointer"
          >
            {/* Contenedor de la Imagen con Fallback */}
            <div className="overflow-hidden rounded-lg h-48 bg-gray-50 dark:bg-gray-800 flex flex-col items-center justify-center relative p-2 border-b border-gray-100">
              {tieneImagen ? (
                <img 
                  src={blog.imagen} 
                  alt={blog.titulo} 
                  className='w-full h-full object-cover'
                  onError={(e) => {
                    // Si el link guardado en la base de datos se cae, activa el "Image Not Found"
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}

              {/* El marcador visual idéntico para Blogs */}
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
            
            {/* Detalles del Blog */}
            <h3 className="mt-4 mb-2 font-bold text-gray-800 hover:text-indigo-600 transition-colors line-clamp-2">
              {blog.titulo}
            </h3>
            
            <p className='mb-2 text-sm text-gray-600 flex items-center'>
              <FaUser className='inline mr-2 text-gray-400'/>
              {blog.name || "Veterinario MascoTico"}
            </p>
            
            <p className='text-xs text-gray-400'>
              Publicado: {blog.fecha_publicacion || "Reciente"}
            </p>
          </a>
        );
      })}
    </div>
  );
};

export default BlogCards;