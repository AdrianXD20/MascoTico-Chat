import React from 'react';
import { motion } from 'framer-motion'; // Asegúrate de tener Framer Motion instalado
import Button from '../../components/Button';

const fadeIn = (direction = "up", delay = 0) => ({
  hidden: {
    opacity: 0,
    y: direction === "up" ? 50 : 0,
    x: direction === "left" ? -50 : 0,
  },
  show: {
    opacity: 1,
    y: 0,
    x: 0,
    transition: {
      duration: 0.8,
      delay,
    },
  },
});

const ChooseUs = () => {
  return (
    <section className='section-container'>
      <motion.div
        variants={fadeIn("up", 0.2)}
        initial="hidden"
        whileInView="show"
        viewport={{ once: false, amount: 0.7 }}
        className="text-center mb-20"
      >
        <div className='my-24 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 items-center md:gap-12 gap-8 text-left'>
          <div className='text-4xl font-bold '>
            Por qué <br /> elegir Mascotico
          </div>
          <div>
            <h3 className='text-2xl font-semibold mb-3'>Atención veterinaria experta</h3>
            <p className='text-base mb-2'>
              En Mascotico, tus mascotas reciben cuidado de calidad con veterinarios certificados que priorizan su salud y bienestar.
            </p>
            <Button text="Más información" />
          </div>
          <div>
            <h3 className='text-2xl font-semibold mb-3'>Productos de calidad</h3>
            <p className='text-base mb-2'>
              Encuentra productos premium para tus mascotas, desde alimentos hasta accesorios, garantizando su satisfacción y confort.
            </p>
            <Button text="Más información" />
          </div>
          <div>
            <h3 className='text-2xl font-semibold mb-3'>Comodidad y confianza</h3>
            <p className='text-base mb-2'>
              Reserva citas, compra productos esenciales y accede a recursos para el cuidado de tus mascotas, todo desde un solo lugar.
            </p>
            <Button text="Más información" />
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default ChooseUs;
