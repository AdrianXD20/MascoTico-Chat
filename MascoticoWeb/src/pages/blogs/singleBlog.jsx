import React from 'react';
import { useLoaderData } from 'react-router-dom';
import { FaUser } from 'react-icons/fa';
import { FaClock } from 'react-icons/fa6';
import Sidebar from '../../components/Sidebar';

const SingleBlog = () => {
  const data = useLoaderData();

  // Manejo de datos nulos o vacíos
  if (!data) {
    return <div className="text-center text-red-500 py-10">Error al cargar el blog o blog no encontrado.</div>;
  }

  const { titulo, name, contenido, imagen, id_veterinario, fecha_publicacion } = data;

  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

  // Corrección del template literal con backticks
  const imageUrl = imagen.startsWith('http') ? imagen : `${baseUrl}/${imagen}`;

  return (
    <div>
      <div className="py-36 bg-black text-white text-center px-4">
        <h1 className="text-5xl leading-snug font-bold mb-5">Detalles del Blog</h1>
      </div>

      <div className="max-w-7xl mx-auto my-12 flex flex-col md:flex-row gap-12">
        {/* Sección principal */}
        <div className="lg:w-3/4 mx-auto">
          <div>
            <img src={imageUrl} alt="Blog" className="mx-auto w-full rounded mb-5" />
          </div>
          <h2 className="text-3xl font-bold mb-4 text-blue-600 cursor-pointer">{titulo}</h2>
          <p className="mb-3 text-gray-600">
            <FaUser className="inline-flex items-center mr-2" /> {name} | {fecha_publicacion}
          </p>
          <p className="mb-6 text-gray-600">
            <FaClock className="inline-flex items-center mr-2" /> ID Veterinario: {id_veterinario}
          </p>
          <p className="text-sm text-gray-500 mb-6">{contenido}</p>
        </div>

        {/* Sidebar */}
        <div className="lg:w-1/2">
          <Sidebar />
        </div>
      </div>
    </div>
  );
};

export default SingleBlog;
