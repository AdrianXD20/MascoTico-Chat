import React, { useState } from "react";

const AppointmentBooking = () => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);

  const availableTimes = [
    "9:00 am", "10:00 am", "11:00 am", "12:00 pm", "1:00 pm", "2:00 pm",
    "3:00 pm", "4:00 pm", "5:00 pm", "6:00 pm", "7:00 pm", "8:00 pm", "9:00 pm"
  ];

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

        {/* Main Section */}
        <div className="w-2/3 p-6">
          <h2 className="text-xl font-bold mb-4 text-center">Seleccione fecha y hora</h2>
          <div className="flex gap-6 justify-center">
            {/* Calendar */}
            <div className="bg-gray-100 p-4 rounded-lg shadow w-1/2">
              <h3 className="text-center text-lg font-semibold">Febrero 2025</h3>
              <div className="grid grid-cols-7 text-center gap-2 text-gray-600 mt-4">
                {[...Array(28).keys()].map((day) => (
                  <button
                    key={day}
                    className={`py-2 rounded-full ${selectedDate === day + 1 ? "bg-[#2B7A77] text-white" : "hover:bg-[#73B6B2]"} `}
                    onClick={() => setSelectedDate(day + 1)}
                  >
                    {day + 1}
                  </button>
                ))}
              </div>
            </div>

            {/* Available Times */}
            <div className="bg-gray-100 p-4 rounded-lg shadow w-1/2">
              <h3 className="text-lg font-semibold text-center">Horas disponibles</h3>
              <div className="grid grid-cols-3 gap-2 mt-4">
                {availableTimes.map((time) => (
                  <button
                    key={time}
                    className={`p-2 rounded-lg border ${selectedTime === time ? "bg-[#2B7A77] text-white" : "hover:bg-[#73B6B2]"} `}
                    onClick={() => setSelectedTime(time)}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="mt-6 flex justify-between">
            <button className="bg-[#2B7A77] text-white px-6 py-2 rounded-lg">VOLVER</button>
            <button className="bg-[#2B7A77] text-white px-6 py-2 rounded-lg">SIGUIENTE</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentBooking;
