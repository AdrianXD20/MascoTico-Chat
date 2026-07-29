import React, { useState, useEffect } from 'react';
import axiosInstance from '../../utils/AxiosInstance';
import { Plus, Calendar as CalendarIcon, Clock, User, ClipboardList } from 'lucide-react';

// Helper centralizado — mismo patrón que Chat.jsx
const getUserId = () => {
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    return user?.id || null;
  } catch {
    return null;
  }
};

export default function Dates() {
  const [citas,   setCitas]   = useState([]);
  const [loading, setLoading] = useState(true);

  // ── Obtener citas del usuario logueado ─────────────────────────────────────

  const obtenerCitas = async () => {
    try {
      const userId = getUserId();
      if (!userId) {
        setLoading(false);
        return;
      }
      const { data } = await axiosInstance.get(`/citas/usuario/${userId}`);
      setCitas(data || []);
    } catch (error) {
      console.error("Error al obtener las citas:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    obtenerCitas();
  }, []);

  // ── Crear cita de prueba ───────────────────────────────────────────────────

  const crearCitaDePrueba = async () => {
    try {
      const userId = getUserId();
      if (!userId) {
        return alert("No se encontró ningún usuario logueado en el LocalStorage.");
      }

      const nuevaCita = {
        id_usuario:     userId,
        id_veterinario: 1,
        fecha_cita:     "2026-07-01",
        hora:           "16:00",
        razon:          "Chequeo Preventivo de Prueba",
        mascota:        "Perro"
      };

      await axiosInstance.post('/citas', nuevaCita);
      alert("¡Éxito! Cita real insertada en la base de datos.");

      setLoading(true);
      await obtenerCitas();
    } catch (error) {
      console.error("Error al registrar cita de prueba:", error);
      alert("Error al insertar en el backend: " + (error.response?.data?.message || error.message));
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50 pt-28 pb-12 px-4 md:px-8 text-gray-800">
      <div className="max-w-7xl mx-auto">

        {/* Encabezado */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b border-gray-200 pb-5">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              Panel de Citas 📅
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Gestiona tus consultas veterinarias y horarios reservados de MascoTico.
            </p>
          </div>
          <button
            onClick={crearCitaDePrueba}
            className="flex items-center justify-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-medium shadow-sm hover:bg-primary/90 transition-colors self-start md:self-auto"
          >
            <Plus size={18} />
            Agendar Nueva Cita
          </button>
        </div>

        {/* Grid Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Horarios de Atención */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2 border-b border-gray-50 pb-2">
              <Clock size={18} className="text-primary" /> Horarios de la Semana
            </h2>
            <div className="space-y-3 text-sm">
              {[
                { dia: "Lunes",     hrs: "7:00am - 4:00pm", active: true  },
                { dia: "Martes",    hrs: "8:00am - 5:00pm", active: true  },
                { dia: "Miércoles", hrs: "7:00am - 4:00pm", active: true  },
                { dia: "Jueves",    hrs: "7:00am - 4:00pm", active: true  },
                { dia: "Viernes",   hrs: "7:00am - 4:00pm", active: true  },
                { dia: "Sábado",    hrs: "8:00am - 5:00pm", active: false },
              ].map((h, i) => (
                <div key={i} className="flex justify-between items-center py-1">
                  <span className="font-medium text-gray-600">{h.dia}</span>
                  <span className={`font-semibold ${h.active ? "text-emerald-600" : "text-amber-600"}`}>
                    {h.hrs}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Listado de Citas */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
              <ClipboardList size={18} className="text-primary" /> Mis Citas Programadas
            </h2>

            {loading ? (
              <div className="bg-white p-12 rounded-2xl border border-gray-100 text-center text-gray-400">
                Cargando tus citas del sistema...
              </div>
            ) : citas.length === 0 ? (
              <div className="bg-white p-12 rounded-2xl border border-gray-100 text-center text-gray-500 shadow-sm">
                <CalendarIcon size={40} className="mx-auto mb-3 opacity-30 text-gray-400" />
                <p className="font-medium text-base">No tienes citas agendadas actualmente.</p>
                <p className="text-sm text-gray-400 mt-1">
                  Usa el asistente de IA o el botón de arriba para programar una.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {citas.map((cita, index) => (
                  <div
                    key={index}
                    className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:border-primary/30 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-3">
                        <span className="bg-primary/10 text-primary text-xs font-bold px-2.5 py-1 rounded-full">
                          {cita.razon || "Consulta General"}
                        </span>
                        <span className="text-xs text-gray-400 font-medium">
                          ID: #{cita.id}
                        </span>
                      </div>
                      <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2 text-sm">
                        <User size={14} className="text-gray-400" />
                        {cita.id_veterinario
                          ? `Veterinario asignado: #${cita.id_veterinario}`
                          : "Especialista MascoTico"}
                      </h3>
                      <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-1">
                        <CalendarIcon size={14} /> {cita.fecha_cita}
                      </p>
                      <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-1">
                        <Clock size={14} /> {cita.hora || "Hora por confirmar"}
                      </p>
                      {cita.mascota && (
                        <p className="text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded w-fit mt-2 font-medium">
                          Paciente: {cita.mascota}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}