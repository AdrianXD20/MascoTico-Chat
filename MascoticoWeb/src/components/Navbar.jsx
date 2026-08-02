import React, { useState, useEffect, useContext } from "react";
import { NavLink } from "react-router-dom";
import { FaBars, FaShoppingBag, FaTimes } from "react-icons/fa"; // Usando React Icons
import { CircleUserRound } from "lucide-react"; // Importando el nuevo icono de Lucide React
import { CartContext } from "../context/CartContext";
import axiosInstance from "../utils/AxiosInstance";

// Define array de items del menú
const navItems = [
  { path: "/", label: "Inicio" },
  { path: "/Map", label: "Veterinario cerca" },
  { path: "/shop", label: "Tienda" },
  { path: "/blogs", label: "Blogs" },
  { path: "/about", label: "Sobre nosotros" },
  { path: "/contact", label: "Contacto" },
];

// Componente NavItems reutilizable
const NavItems = ({ toggleMenu }) => {
  return (
    <ul className="flex flex-col md:flex-row items-center md:space-x-8 gap-8">
      {navItems.map((item, index) => (
        <li key={index} onClick={toggleMenu}>
          <NavLink
            to={item.path}
            className={({ isActive }) =>
              isActive ? "text-primary font-bold" : "hover:text-primary"
            }
          >
            {item.label}
          </NavLink>
        </li>
      ))}
    </ul>
  );
};

const Navbar = () => {
  const { cartCount, isCartOpen, toggleCart } = useContext(CartContext); // Añade estado del carrito
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false); // Estado para el menú móvil
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    if (typeof window === "undefined") return false;
    const token = localStorage.getItem("jwt");
    const user = localStorage.getItem("user");
    return Boolean(token && user);
  });

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    const checkLoginState = () => {
      const token = localStorage.getItem("jwt");
      const user = localStorage.getItem("user");
      setIsLoggedIn(Boolean(token && user));
    };

    checkLoginState();
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("storage", checkLoginState);
    window.addEventListener("focus", checkLoginState);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("storage", checkLoginState);
      window.removeEventListener("focus", checkLoginState);
    };
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen((prevState) => !prevState); // Alternar estado del menú
  };

 const handleLogout = async () => {
    try {
      const token = localStorage.getItem("jwt");
      if (token) {
        await axiosInstance.post("/logout", {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
    } catch (error) {
      console.error("Error al cerrar sesión en el servidor:", error);
      // No bloqueamos el logout local aunque falle la petición al backend
    } finally {
      localStorage.removeItem("jwt");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      localStorage.removeItem("chat_conversation_id");
      setIsLoggedIn(false);
      window.location.href = "/";
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition duration-300 ease-in-out ${
        isScrolled ? "bg-white shadow-md text-black" : "bg-transparent text-white"
      }`}
    >
      <nav className="max-w-screen-2xl container mx-auto py-6 px-4 flex justify-between items-center">
        <NavLink to="/" className="font-bold">
          MASCOTICO
        </NavLink>

        {/* Icono hamburguesa para móvil */}
        <div className="md:hidden text-xl cursor-pointer" onClick={toggleMenu}>
          {isMenuOpen ? null : <FaBars />}
        </div>

        {/* Items del menú de escritorio */}
        <div className="hidden md:flex">
          <NavItems />
        </div>

        {/* Contenedor de carrito y usuario alineados a la derecha */}
        <div className="flex items-center ml-6 space-x-6">
          {/* Icono del carrito */}
          <div
            className="relative cursor-pointer"
            onClick={toggleCart} // Abre/cierra el carrito al hacer clic
          >
            <FaShoppingBag className="text-xl" />
            <sup className="absolute top-0 -right-3 bg-primary text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
              {cartCount}
            </sup>
          </div>

          {/* Icono de usuario */}
          <div className="relative flex items-center group">
            <span className="flex-center gap-1 hover:bg-white/5 cursor-pointer px-3 py-1 rounded-xl">
              <CircleUserRound className="text-xl" /> {/* Icono de usuario */}
              {isLoggedIn && <span className="text-sm font-medium">Salir</span>}
            </span>
            
            {/* Submenú corregido con puente invisible y link a perfil */}
            <div className="absolute top-10 right-0 bg-gray-100 text-gray-900 p-4 rounded-md shadow-lg w-48 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto before:content-[''] before:absolute before:top-[-20px] before:left-0 before:w-full before:h-[20px]">
              <ul>
                <li className="py-2 hover:bg-gray-300 cursor-pointer px-2 rounded">
                  <NavLink to="/perfil" className="block w-full">Mis Citas 📅</NavLink>
                </li>
                <hr className="my-1 border-gray-200" />
                {isLoggedIn ? (
                  <li className="py-2 hover:bg-gray-300 cursor-pointer px-2 rounded">
                    <button onClick={handleLogout} className="block w-full text-left">Cerrar sesión</button>
                  </li>
                ) : (
                  <>
                    <li className="py-2 hover:bg-gray-300 cursor-pointer px-2 rounded">
                      <NavLink to="/login" className="block w-full">Iniciar Sesión</NavLink>
                    </li>
                    <li className="py-2 hover:bg-gray-300 cursor-pointer px-2 rounded">
                      <NavLink to="/signUp" className="block w-full">Registrarse</NavLink>
                    </li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </div>

        {/* Menú móvil */}
        <div
          className={`fixed top-0 left-0 w-full h-screen bg-black bg-opacity-80 flex flex-col items-center justify-center space-y-8 text-white transition-transform transform ${
            isMenuOpen ? "translate-x-0" : "-translate-x-full"
          } md:hidden`}
        >
          <div className="absolute top-4 right-4 text-xl cursor-pointer" onClick={toggleMenu}>
            <FaTimes />
          </div>
          <NavItems toggleMenu={toggleMenu} />
        </div>
      </nav>

      {/* Modal del carrito */}
      {isCartOpen && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50">
          
        </div>
      )}
    </header>
  );
};

export default Navbar;