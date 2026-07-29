import React from 'react';

export const TarjetaCita = ({ data }) => {
  if (!data) return null;

  // Validación: si los datos son inválidos, no renderizamos la tarjeta confirmada
  const esValido = data.fecha && data.veterinario && data.veterinario !== "None";

  return (
    <div className={`mt-3 border rounded-xl p-4 shadow-sm max-w-sm ${esValido ? "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200" : "bg-red-50 border-red-200"}`}>
      <div className="flex items-center justify-between border-b border-blue-100 pb-2 mb-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">
          {esValido ? "🗓️ Cita Agendada" : "⚠️ Datos Incompletos"}
        </span>
      </div>
      
      <div className="space-y-1.5 text-sm text-gray-700">
        <p><strong>Paciente:</strong> {data.mascota || "N/A"}</p>
        <p><strong>Especialista:</strong> {data.veterinario === "None" ? "No seleccionado" : data.veterinario}</p>
        <p><strong>Fecha:</strong> {data.fecha || "No especificada"}</p>
      </div>
    </div>
  );
};