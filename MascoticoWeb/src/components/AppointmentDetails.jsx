import React, { useState } from "react";

const AppointmentDetails = () => {
  const [description, setDescription] = useState("");
  const [medicalReport, setMedicalReport] = useState(null);

  const handleDescriptionChange = (e) => setDescription(e.target.value);
  const handleFileChange = (e) => setMedicalReport(e.target.files[0]);

  const handleBack = () => {
    // Logic for going back
    console.log("Going back");
  };

  const handleNext = () => {
    // Logic for proceeding to the next step
    console.log("Proceeding to next step");
  };

  return (
    <div className="flex h-screen w-full justify-center items-center bg-gray-100">
      <div className="w-3/4 max-w-5xl bg-white shadow-lg rounded-lg flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-1/3 bg-[#2B7A77] text-white p-6 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-white rounded-full"></span>
            <p className="font-bold">Tipo de Servicio</p>
          </div>
          <p className="text-sm">Elija cómo desea ser atendid@</p>
          <div className="border-l-4 border-white pl-2">
            <p className="text-gray-300">Seleccione fecha y hora</p>
            <p className="text-gray-400 text-xs">Seleccione la fecha para ver el calendario de las plazas disponibles</p>
          </div>
          <div className="border-l-4 border-white pl-2">
            <p className="text-gray-300">Detalles de la cita</p>
            <p className="text-gray-400 text-xs">Especifique el motivo de la consulta</p>
          </div>
          <div className="border-l-4 border-white pl-2">
            <p className="text-gray-300">Registro o acceso de cliente</p>
            <p className="text-gray-400 text-xs">Accede a tu cuenta o regístrate</p>
          </div>
          <div className="border-l-4 border-white pl-2">
            <p className="text-gray-300">Confirmación</p>
            <p className="text-gray-400 text-xs">Confirma tu reserva</p>
          </div>
        </div>

        {/* Main Content */}
        <main className="w-3/4 p-8 flex flex-col gap-6 bg-gray-100">
          <h2 className="text-xl font-semibold">Más sobre la cita</h2>

          {/* Descripción de la cita */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">Descripciones de cita</label>
            <textarea
              value={description}
              onChange={handleDescriptionChange}
              className="w-full p-3 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#73B6B2]"
              rows="5"
              placeholder="Explique qué animal necesita asistencia y cuál es el motivo de su visita"
            ></textarea>
          </div>

          {/* Añadir informe médico */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">Añadir informe médico</label>
            <input
              type="file"
              onChange={handleFileChange}
              className="w-full p-2 border border-gray-300 rounded-md bg-gray-50"
            />
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end gap-4">
            <button
              onClick={handleBack}
              className="bg-[#2B7A77] text-white px-6 py-2 rounded-md"
            >
              VOLVER
            </button>
            <button
              onClick={handleNext}
              className="bg-[#2B7A77] text-white px-6 py-2 rounded-md"
            >
              SIGUIENTE
            </button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppointmentDetails;
