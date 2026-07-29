import React, { useState, useEffect } from 'react';
import axiosInstance from '../../utils/AxiosInstance';
import { Plus, Calendar as CalendarIcon, Clock, User, ClipboardList } from 'lucide-react';

export default function Dates() {
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Obtener de forma automática las citas del usuario logueado
  useEffect(() => {
    const obtenerCitas = async () => {
      try {
        const usuarioGuardado = localStorage.getItem("user");
        const user = usuarioGuardado ? JSON.parse(usuarioGuardado) : null;
        const userId = user?.id; // Tu ID automático (ej: 4)

        if (!userId) {
          setLoading(false);
          return;
        }

        // Ajusta este endpoint según la estructura real de tu API de Node
        const { data } = await axiosInstance.get(`/chat/conversaciones/${userId}`); 
        // Nota: Cambia la URL anterior por tu endpoint real de citas, ej: `/citas/usuario/${userId}`
        
        // Simulamos o asignamos la respuesta
        setCitas(data.citas || []); 
      } catch (error) {
        console.error("Error al obtener las citas:", error);
      } finally {
        setLoading(false);
      }
    };

    obtenerCitas();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pt-28 pb-12 px-4 md:px-8 text-gray-800">
      <div className="max-w-7xl mx-auto">
        
        {/* Encabezado de la sección */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b border-gray-200 pb-5">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              Panel de Citas 📅
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Gestiona tus consultas veterinarias y horarios reservados de MascoTico.
            </p>
          </div>
          <button className="flex items-center justify-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-medium shadow-sm hover:bg-primary/90 transition-colors self-start md:self-auto">
            <Plus size={18} />
            Agendar Nueva Cita
          </button>
        </div>

        {/* Grid Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Columna Izquierda: Horarios de Atención */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2 border-b border-gray-50 pb-2">
              <Clock size={18} className="text-primary" /> Horarios de la Semana
            </h2>
            <div className="space-y-3 text-sm">
              {[
                { dia: "Lunes", hrs: "7:00am - 4:00pm", active: true },
                { dia: "Martes", hrs: "8:00am - 5:00pm", active: true },
                { dia: "Miércoles", hrs: "7:00am - 4:00pm", active: true },
                { dia: "Jueves", hrs: "7:00am - 4:00pm", active: true },
                { dia: "Viernes", hrs: "7:00am - 4:00pm", active: true },
                { dia: "Sábado", hrs: "8:00am - 5:00pm", active: false },
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

          {/* Columna Derecha / Centro: Listado de Citas del Usuario */}
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
                <p className="text-sm text-gray-400 mt-1">Usa el asistente de IA o el botón de arriba para programar una.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {citas.map((cita, index) => (
                  <div key={index} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:border-primary/30 transition-all flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-3">
                        <span className="bg-primary/10 text-primary text-xs font-bold px-2.5 py-1 rounded-full">
                          {cita.motivo || "Consulta General"}
                        </span>
                        <span className="text-xs text-gray-400 font-medium">
                          ID: #{cita.id_cita || cita.id}
                        </span>
                      </div>
                      <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2 text-sm">
                        <User size={14} className="text-gray-400" /> {cita.veterinario || "Especialista MascoTico"}
                      </h3>
                      <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-1">
                        <CalendarIcon size={14} /> {new Date(cita.fecha).toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'short' })}
                      </p>
                      <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-1">
                        <Clock size={14} /> {cita.hora || "Hora por confirmar"}
                      </p>
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