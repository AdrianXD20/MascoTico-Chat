import React, { useState } from "react";

const Registro = () => {
  const [activeTab, setActiveTab] = useState("registro");

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
        <main className="w-3/4 p-8 bg-gray-100 flex flex-col">
          <h1 className="text-2xl font-bold mb-4 text-[#2B7A77]">Introduzca detalles</h1>
          <div className="bg-white p-6 rounded-lg shadow-md">
            {/* Tabs */}
            <div className="flex border-b mb-4">
              <button 
                className={`py-2 px-4 border-b-2 font-semibold ${activeTab === "registro" ? "border-[#2B7A77] text-[#2B7A77]" : "text-gray-500"}`}
                onClick={() => setActiveTab("registro")}
              >
                Registro
              </button>
              <button 
                className={`py-2 px-4 font-semibold ${activeTab === "login" ? "border-b-2 border-[#2B7A77] text-[#2B7A77]" : "text-gray-500"}`}
                onClick={() => setActiveTab("login")}
              >
                Inicio de sesión
              </button>
            </div>

            {activeTab === "registro" ? (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#2B7A77]">Nombre *</label>
                  <input className="w-full border p-2 rounded" placeholder="Introduzca su nombre" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#2B7A77]">Apellido *</label>
                  <input className="w-full border p-2 rounded" placeholder="Introduzca sus apellidos" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#2B7A77]">Correo electrónico *</label>
                  <input className="w-full border p-2 rounded" placeholder="Introduzca su email" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#2B7A77]">Celular *</label>
                  <div className="flex">
                    <select className="border p-2 rounded-l bg-gray-100">
                      <option>+52</option>
                    </select>
                    <input className="w-full border p-2 rounded-r" placeholder="Introduzca su número" />
                  </div>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-[#2B7A77]">Género *</label>
                  <div className="flex gap-4">
                    <label className="flex items-center">
                      <input type="radio" name="genero" className="mr-2" /> Hombre
                    </label>
                    <label className="flex items-center">
                      <input type="radio" name="genero" className="mr-2" /> Mujer
                    </label>
                    <label className="flex items-center">
                      <input type="radio" name="genero" className="mr-2" /> Otros
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#2B7A77]">Empresa</label>
                  <input className="w-full border p-2 rounded" placeholder="Nombre de la empresa, si aplica" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#2B7A77]">RFC</label>
                  <input className="w-full border p-2 rounded" placeholder="RFC de la empresa, si aplica" />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#2B7A77]">Correo electrónico *</label>
                  <input className="w-full border p-2 rounded" placeholder="Introduzca su email" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#2B7A77]">Contraseña *</label>
                  <input type="password" className="w-full border p-2 rounded" placeholder="Introduzca su contraseña" />
                </div>
              </div>
            )}

            {/* Buttons */}
            <div className="flex justify-between mt-6">
              <button className="bg-[#2B7A77] text-white px-6 py-2 rounded">VOLVER</button>
              <button className="bg-[#2B7A77] text-white px-6 py-2 rounded">{activeTab === "registro" ? "REGISTRO" : "INICIAR SESIÓN"}</button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Registro;
