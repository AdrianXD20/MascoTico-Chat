import React from 'react';
import { motion } from 'framer-motion'; // Asegúrate de que Framer Motion esté instalado
import material3 from "../../assets/material3.png";
import material1 from "../../assets/material1.png";
import material2 from "../../assets/material2.png";
import Button from '../../components/Button';

const Materials = () => {
  return (
    <section className='my-24 section-container flex flex-col md:flex-row items-center justify-between md:gap-20 gap-8'>
      {/* Texto con animaciones */}
      <motion.div
        className='md:w-1/2 mx-auto'
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.8 }}
      >
        <h3 className='text-lg font-semibold text-primary mb-4'>Materiales</h3>
        <h2 className='text-4xl font-bold mb-4 capitalize lg:w-1/2'>
          Materiales de alta calidad para el cuidado de tus mascotas
        </h2>
        <p className='text-secondary dark:text-white mb-5 lg:w-2/3'>
          En Mascotico, utilizamos los mejores materiales para ofrecerte productos de calidad superior, desde alimentos hasta accesorios, todo pensando en el bienestar de tu mascota.
        </p>
        <Button text="Más información" />
      </motion.div>

      {/* Imágenes (sin animación para mantener diseño original) */}
      <div className='md:w-1/2 grid grid-cols-2 md:grid-cols-3 md:items-end items-center'>
        <div>
          <img src={material1} alt="Material 1" className='' />
          <img src={material2} alt="Material 2" className='' />
        </div>
        <div className='md:col-span-2 col-span-1'>
          <img src={material3} alt="Material 3" className='w-full md:h-[547px]' />
        </div>
      </div>
    </section>
  );
};

export default Materials;
