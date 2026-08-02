import React, { useState } from 'react';
import axiosInstance from '../../utils/AxiosInstance';
import googleIcon from '../../assets/google.svg';
import imageSrc from '../../assets/account.jpg';
import { NavLink, useNavigate } from 'react-router-dom';

function Login() {
  const [email,     setEmail]     = useState("");
  const [contraseña, setContraseña] = useState("");
  const [error,     setError]     = useState("");
  const [loading,   setLoading]   = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await axiosInstance.post('/Login', {
        email,
        contraseña,           // ← el back espera "contraseña", no "password"
      });

      // El back responde { JWT, user } — no { token }
      const { JWT, refreshToken, user } = response.data;

      if (!JWT) {
        setError("Respuesta inválida del servidor");
        return;
      }

      // Guardar token y datos del usuario
      localStorage.setItem('jwt', JWT);
      if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.removeItem('chat_conversation_id');

      // Redirigir al inicio
      navigate('/');

    } catch (err) {
      const msg = err.response?.data?.message || "Credenciales incorrectas";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-black min-h-screen flex items-center justify-center">
      <div className="relative flex flex-col m-6 space-y-8 bg-white shadow-2xl rounded-2xl md:flex-row md:space-y-0">

        {/* Lado izquierdo — formulario */}
        <div className="flex flex-col justify-center p-8 md:p-14">
          <h1 className="mb-3 text-4xl font-bold">¡Bienvenido a MascoTico!</h1>
          <p className="font-light text-gray-400 mb-8">
            ¡Bienvenido de nuevo! Por favor, ingresa tus datos
          </p>

          <form onSubmit={handleLogin}>
            {/* Email */}
            <div className="py-4">
              <label htmlFor="email" className="mb-2 text-md">
                Correo electrónico
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md placeholder-gray-500"
                placeholder="Ingresa tu correo"
                required
              />
            </div>

            {/* Contraseña */}
            <div className="py-4">
              <label htmlFor="pass" className="mb-2 text-md">
                Contraseña
              </label>
              <input
                type="password"
                id="pass"
                name="pass"
                value={contraseña}
                onChange={(e) => setContraseña(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md placeholder-gray-500"
                placeholder="Ingresa tu contraseña"
                required
              />
            </div>

            {/* Recordar / Olvidé contraseña */}
            <div className="flex justify-between items-center w-full py-4">
              <label className="flex items-center text-md">
                <input
                  type="checkbox"
                  name="remember"
                  id="remember"
                  className="mr-2"
                />
                Recordar por 30 días
              </label>
              <NavLink
                to="/forgot-password"
                className="font-bold text-md text-black hover:underline"
              >
                Olvidé mi contraseña
              </NavLink>
            </div>

            {/* Error */}
            {error && (
              <p className="text-red-500 text-sm mb-4">{error}</p>
            )}

            {/* Botón submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white p-2 rounded-lg mb-6 hover:bg-white hover:text-black hover:border hover:border-gray-300 focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed transition-all"
            >
              {loading ? "Iniciando sesión..." : "Iniciar sesión"}
            </button>

            {/* Google — sin funcionalidad activa */}
            <button
              type="button"
              className="w-full border border-gray-300 text-md p-2 rounded-lg mb-6 hover:bg-black hover:text-white focus:outline-none transition-all"
            >
              <img
                src={googleIcon}
                alt="Icono de Google"
                className="w-6 h-6 inline mr-2"
              />
              Iniciar sesión con Google
            </button>
          </form>

          <div className="text-center text-gray-400">
            ¿No tienes una cuenta?{' '}
            <NavLink to="/signUp" className="font-bold text-black hover:underline">
              Regístrate gratis
            </NavLink>
          </div>
        </div>

        {/* Lado derecho — imagen */}
        <div className="relative">
          <img
            src={imageSrc}
            alt="Imagen de bienvenida"
            className="w-[400px] h-full hidden rounded-r-2xl md:block object-cover"
          />
          <div className="absolute hidden bottom-10 right-6 p-6 bg-white bg-opacity-30 backdrop-blur-sm rounded drop-shadow-lg md:block">
            <p className="text-white text-xl">
              Únete a nuestra comunidad y juntos<br />
              elevemos la calidad de vida de <br />
              nuestras mascotas a nuevas alturas
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Login;