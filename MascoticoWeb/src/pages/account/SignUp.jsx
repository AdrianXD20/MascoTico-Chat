import React, { useState, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import ReCAPTCHA from 'react-google-recaptcha';
import googleIcon from '../../assets/google.svg';
import imageSrc from '../../assets/account.jpg';
import axiosInstance from '../../utils/AxiosInstance';

function SignUp() {
  const navigate = useNavigate();
  const recaptchaRef = useRef(null);

  const [formData, setFormData] = useState({
    nombre:          '',
    email:           '',
    password:        '',
    confirmPassword: '',
    acceptTerms:     false,
  });

  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (!formData.acceptTerms) {
      setError('Debes aceptar los términos y condiciones');
      return;
    }

    const captchaToken = recaptchaRef.current.getValue();
    if (!captchaToken) {
      setError('Por favor completa el CAPTCHA');
      return;
    }

    setLoading(true);

    try {
      await axiosInstance.post('/register', {
        nombre:       formData.nombre,
        email:        formData.email,
        contraseña:   formData.password,
        captchaToken,
      });

      setSuccess('¡Cuenta creada exitosamente! Redirigiendo...');
      setTimeout(() => navigate('/login'), 1500);

    } catch (err) {
      recaptchaRef.current.reset();
      const msg = err.response?.data?.message || 'Error al registrar tu cuenta. Inténtalo de nuevo.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <div className="relative flex flex-col m-6 space-y-8 bg-white shadow-2xl rounded-2xl md:flex-row md:space-y-0">

        {/* Formulario */}
        <div className="flex flex-col justify-center p-8 md:p-14">
          <h1 className="mb-3 text-4xl font-bold">Crea tu cuenta</h1>
          <p className="font-light text-gray-400 mb-8">
            ¡Únete a nosotros y comienza tu viaje hoy mismo!
          </p>

          <form onSubmit={handleSubmit}>
            {/* Nombre */}
            <div className="py-4">
              <label htmlFor="nombre" className="mb-2 text-md">Nombre</label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md placeholder-gray-500"
                placeholder="Tu nombre"
                required
              />
            </div>

            {/* Apellido */}
            {/*
            <div className="py-4">
              <label htmlFor="apellido" className="mb-2 text-md">Apellido</label>
              <input
                type="text"
                id="apellido"
                name="apellido"
                value={formData.apellido}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md placeholder-gray-500"
                placeholder="Tu apellido"
                required
              />
            </div>*/}

            {/* Email */}
            <div className="py-4">
              <label htmlFor="email" className="mb-2 text-md">Correo electrónico</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md placeholder-gray-500"
                placeholder="tu@correo.com"
                required
              />
            </div>

            {/* Contraseña */}
            <div className="py-4">
              <label htmlFor="password" className="mb-2 text-md">Contraseña</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md placeholder-gray-500"
                placeholder="Mínimo 6 caracteres"
                required
                minLength={6}
              />
            </div>

            {/* Confirmar contraseña */}
            <div className="py-4">
              <label htmlFor="confirmPassword" className="mb-2 text-md">Confirmar contraseña</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md placeholder-gray-500"
                placeholder="Repite tu contraseña"
                required
              />
            </div>

            {/* Términos */}
            <div className="flex items-center py-4">
              <input
                type="checkbox"
                id="acceptTerms"
                name="acceptTerms"
                className="mr-2"
                checked={formData.acceptTerms}
                onChange={handleChange}
              />
              <label htmlFor="acceptTerms" className="text-md">
                Acepto los <span className="font-bold">términos y condiciones</span>
              </label>
            </div>

            {/* reCAPTCHA */}
            <div className="flex justify-center py-2">
              <ReCAPTCHA
                ref={recaptchaRef}
                sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY || '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI'}
              />
            </div>

            {/* Mensajes de error / éxito */}
            {error   && <p className="text-red-500 text-sm mb-4">{error}</p>}
            {success && <p className="text-green-600 text-sm mb-4">{success}</p>}

            {/* Botón submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white p-2 rounded-lg mb-6 hover:bg-white hover:text-black hover:border hover:border-gray-300 focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed transition-all"
            >
              {loading ? 'Creando cuenta...' : 'Registrarse'}
            </button>
          </form>

          {/* Google — sin funcionalidad activa */}
          <button className="w-full border border-gray-300 text-md p-2 rounded-lg mb-6 hover:bg-black hover:text-white focus:outline-none transition-all">
            <img src={googleIcon} alt="Icono de Google" className="w-6 h-6 inline mr-2" />
            Registrarse con Google
          </button>

          <div className="text-center text-gray-400">
            ¿Ya tienes una cuenta?{' '}
            <NavLink to="/login" className="font-bold text-black hover:underline">
              Inicia sesión
            </NavLink>
          </div>
        </div>

        {/* Imagen */}
        <div className="relative">
          <img
            src={imageSrc}
            alt="Imagen principal"
            className="w-[400px] h-full hidden rounded-r-2xl md:block object-cover"
          />
          <div className="absolute hidden bottom-10 right-6 p-6 bg-white bg-opacity-30 backdrop-blur-sm rounded drop-shadow-lg md:block">
            <p className="text-white text-xl">
              ¡Únete a nuestra comunidad y ayuda a mejorar<br />
              la vida de las mascotas en todas partes!
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

export default SignUp;