import React from 'react';
import { motion } from 'framer-motion'; // Asegúrate de tener Framer Motion instalado
import expriencesImg from "../../assets/expricences.png";
import Button from '../../components/Button';

const Expricences = () => {
  return (
    <section className='my-24 section-container flex flex-col md:flex-row items-center justify-between md:gap-20 gap-8'>
      {/* Imagen con animación */}
      <motion.div
        className='md:w-1/2 md:h-[547px]'
        initial={{ x: -50, opacity: 0 }}
        whileInView={{ x: 0, opacity: 1 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.8 }}
      >
        <img src={expriencesImg} alt="Experiencia" className='h-full w-full' />
      </motion.div>

      {/* Texto con animación */}
      <motion.div
        className='md:w-1/2 mx-auto'
        initial={{ x: 50, opacity: 0 }}
        whileInView={{ x: 0, opacity: 1 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.8 }}
      >
        <h3 className='text-lg font-semibold text-primary mb-4'>Experiencias</h3>
        <h2 className='text-4xl font-bold mb-4 capitalize lg:w-1/2'>
          Te ofrecemos la mejor experiencia para tus mascotas
        </h2>
        <p className='text-secondary dark:text-white mb-5 lg:w-2/3'>
          No tienes que preocuparte por el bienestar de tus mascotas, ya que nuestros veterinarios y profesionales cuidan de ellas con el más alto estándar, usando productos de calidad y ofreciendo un servicio personalizado.
        </p>
        <Button text="Más información" />
      </motion.div>
    </section>
  );
};

export default Expricences;
