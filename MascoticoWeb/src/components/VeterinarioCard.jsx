import React from "react";

/**
 * Card component to render veterinarian information.
 * Expected data shape: { id, nombre, hora_apertura, hora_cierre }
 */
export const VeterinarioCard = ({ data }) => {
  if (!data) return null;
  const { nombre = "Veterinario", hora_apertura = "?", hora_cierre = "?" } = data;
  return (
    <div className="border rounded-xl p-4 shadow-sm bg-white hover:shadow-md transition-shadow">
      <h3 className="text-lg font-semibold text-gray-800 mb-2">{nombre}</h3>
      <p className="text-sm text-gray-600">
        Horario: {hora_apertura} - {hora_cierre}
      </p>
    </div>
  );
};
