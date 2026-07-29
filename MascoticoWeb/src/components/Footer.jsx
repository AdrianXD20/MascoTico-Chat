import React from 'react';
import { FaFacebookF, FaTwitter, FaInstagram } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="bg-secondary-bg text-black econdary dark:bg-gray-800 dark:text-white pt-20 mt-5 pb-5">
            <div className="section-container grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-8 px-8">
                {/* First Div: Logo and Description (Wider Column) */}
                <div className="md:col-span-2">
                    <h2 className="text-2xl font-bold mb-4">Mascoticos</h2>
                    <p className=" md:mr-12">
                        Mascoticos se dedica a ayudar a encontrar un hogar para mascotas necesitadas. Nos apasiona conectar a los animales con familias que los cuiden y los amen. Nuestro objetivo es transformar la vida de cada mascota con amor y bienestar.
                    </p>
                </div>
                
                {/* Second Div: Menu 1 */}
                <div>
                    <h3 className="text-xl font-semibold mb-4">Enlaces Rápidos</h3>
                    <ul className="space-y-2">
                        <li>
                            <a href="#" className=" hover:text-primary transition">Sobre Nosotros</a>
                        </li>
                        <li>
                            <a href="#" className=" hover:text-primary transition">Servicios</a>
                        </li>
                        <li>
                            <a href="#" className=" hover:text-primary transition">Contacta con Nosotros</a>
                        </li>
                    </ul>
                </div>

                {/* Third Div: Menu 2 */}
                <div>
                    <h3 className="text-xl font-semibold mb-4">Atención al Cliente</h3>
                    <ul className="space-y-2">
                        <li>
                            <a href="#" className=" hover:text-primary transition">Preguntas Frecuentes</a>
                        </li>
                        <li>
                            <a href="#" className=" hover:text-primary transition">Adopciones</a>
                        </li>
                        <li>
                            <a href="#" className=" hover:text-primary transition">Soporte</a>
                        </li>
                    </ul>
                </div>

                {/* Fourth Div: Social Media */}
                <div>
                    <h3 className="text-xl font-semibold mb-4">Síguenos</h3>
                    <div className="flex flex-col space-y-2">
                        <a href="https://www.facebook.com/frenyer.segura/" className="flex items-center space-x-2  hover:text-blue-600 transition">
                            <FaFacebookF /> <span>Facebook</span>
                        </a>
                        <a href="https://x.com/FrenKsx" className="flex items-center space-x-2  hover:text-blue-700 transition">
                            <FaTwitter /> <span>Twitter</span>
                        </a>
                        <a href="https://www.instagram.com/frenksxr/?__pwa=1" className="flex items-center space-x-2  hover:text-rose-700 transition">
                            <FaInstagram /> <span>Instagram</span>
                        </a>
                    </div>
                </div>
            </div>

            {/* Bottom Footer */}
            <div className="mt-12 section-container flex flex-col sm:flex-row sm:justify-between sm:items-center sm:text-center gap-4 text-left text-black dark:bg-gray-800 dark:text-white border-t border-gray-300 pt-4">
               <p> &copy; {new Date().getFullYear()} Mascoticos. Todos los derechos reservados.</p>
               <p className='flex gap-4'>
                <Link  to="/">Términos y Condiciones</Link>
                <Link to="/">Política de Privacidad</Link>
               </p>
            </div>
        </footer>
    );
};

export default Footer;
