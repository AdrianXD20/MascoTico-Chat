import React, { useEffect, useState } from 'react';

export default function PerfilUsuario({ idUsuario = 4 }) {
  const [citas, setCitas] = useState([]);
  const [compras, setCompras] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function cargarDatosPerfil() {
      setLoading(true);
      try {
        const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
        const [resCitas, resCompras] = await Promise.all([
          fetch(`${apiBase}/usuarios/${idUsuario}/citas`),
          fetch(`${apiBase}/usuarios/${idUsuario}/compras`)
        ]);

        if (resCitas.ok) setCitas(await resCitas.json());
        if (resCompras.ok) setCompras(await resCompras.json());
      } catch (err) {
        console.error("Error al jalar historial del perfil:", err);
      } finally {
        setLoading(false);
      }
    }
    cargarDatosPerfil();
  }, [idUsuario]);

  if (loading) {
    return <p className="text-center text-gray-400 italic py-20">Cargando tus datos en MascoTico...</p>;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 bg-white rounded-2xl shadow-sm border border-gray-100 mt-6 animate-fadeIn">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Mi Cuenta 🐾</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* PANEL DE CITAS */}
        <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
          <h3 className="font-bold text-lg text-gray-700 mb-4">🗓️ Mis Próximas Citas</h3>
          <div className="space-y-3">
            {citas.length > 0 ? citas.map(c => (
              <div key={c.id} className="p-4 bg-white rounded-lg shadow-sm border border-gray-100 hover:border-indigo-200 transition-colors">
                <p className="font-bold text-indigo-600">{c.mascota || "Mi Mascota"} - Consulta</p>
                <p className="text-sm text-gray-600">Fecha: {c.fecha} a las {c.hora}</p>
                <p className="text-xs text-gray-400 mt-1">Veterinario: {c.veterinario || "General"}</p>
              </div>
            )) : <p className="text-sm text-gray-400 italic">No tienes citas programadas.</p>}
          </div>
        </div>

        {/* PANEL DE COMPRAS */}
        <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
          <h3 className="font-bold text-lg text-gray-700 mb-4">🛍️ Historial de Compras</h3>
          <div className="space-y-3">
            {compras.length > 0 ? compras.map(com => (
              <div key={com.id} className="p-4 bg-white rounded-lg shadow-sm border border-gray-100 flex justify-between items-center">
                <div>
                  <p className="font-bold text-gray-800">{com.nombre_producto}</p>
                  <p className="text-xs text-gray-400">Cantidad: {com.cantidad || 1}</p>
                </div>
                <p className="font-bold text-emerald-600">${com.total}</p>
              </div>
            )) : <p className="text-sm text-gray-400 italic">Aún no has realizado compras.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}