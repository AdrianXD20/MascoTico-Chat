import React from "react";

const ServiceSelection = () => {
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
        <div className="w-2/3 p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Seleccione el servicio</h2>
            <input type="text" placeholder="Buscar..." className="p-2 border rounded-md w-1/4" />
          </div>

          <div className="space-y-6">
            {/* Asesoría */}
            <div>
              <h3 className="text-[#2B7A77] font-bold text-lg">Asesoría</h3>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <ServiceCard title="Asesoría Online Dieta Y Cuidados" price={220} imgSrc="https://via.placeholder.com/150" />
                <ServiceCard title="Asesoría Online por Enfermedad" price={260} imgSrc="https://via.placeholder.com/150" />
              </div>
            </div>

            {/* Consulta Online */}
            <div>
              <h3 className="text-[#2B7A77] font-bold text-lg">Consulta Online</h3>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <ServiceCard title="Guía para Nuevos Propietarios" price={150} imgSrc="https://via.placeholder.com/150" />
                <ServiceCard title="Consulta Online por Enfermedad" price={260} imgSrc="https://via.placeholder.com/150" />
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <button className="bg-[#2B7A77] text-white px-6 py-2 rounded-md">SIGUIENTE</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ServiceCard = ({ title, price, imgSrc }) => {
  return (
    <div className="bg-white p-4 shadow-md rounded-md flex flex-col items-center text-center">
      <img src={imgSrc} alt={title} className="w-20 h-20 rounded-full mb-2" />
      <p className="font-semibold">{title}</p>
      <p className="text-[#73B6B2] font-bold">MX${price}</p>
    </div>
  );
};

export default ServiceSelection;
