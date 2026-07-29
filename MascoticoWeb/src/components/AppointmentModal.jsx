import React, { useState } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";

moment.locale("en-GB");
const localizer = momentLocalizer(moment);

const AppointmentCalendar = () => {
  const [eventsData, setEventsData] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [appointmentDetails, setAppointmentDetails] = useState({
    time: "",
    animalType: "",
    description: ""
  });

  const handleSelect = ({ start, end }) => {
    setSelectedSlot({ start, end });
    setModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { time, animalType, description } = appointmentDetails;
    if (time && animalType && description) {
      setEventsData([...eventsData, { 
        start: new Date(selectedSlot.start.setHours(time.split(":")[0], time.split(":")[1])),
        end: new Date(selectedSlot.start.setHours(time.split(":")[0], time.split(":")[1]) + 3600000),
        title: `${animalType} - ${description}`
      }]);
      setModalOpen(false);
      setAppointmentDetails({ time: "", animalType: "", description: "" });
    } else {
      alert("Por favor, completa todos los campos.");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-5xl bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-bold mb-4 text-center">Calendario de Citas</h2>
        <Calendar
          views={["day", "agenda", "work_week", "month"]}
          selectable
          localizer={localizer}
          defaultDate={new Date()}
          defaultView="month"
          events={eventsData}
          style={{ height: "75vh" }}
          onSelectEvent={(event) => alert(event.title)}
          onSelectSlot={handleSelect}
        />
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-30">
          <div className="bg-white p-6 rounded-lg w-11/12 md:w-1/3">
            <h2 className="text-xl font-bold mb-4">Agendar Cita</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Hora</label>
                <input
                  type="time"
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                  value={appointmentDetails.time}
                  onChange={(e) => setAppointmentDetails({ ...appointmentDetails, time: e.target.value })}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Tipo de Animal</label>
                <select
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                  value={appointmentDetails.animalType}
                  onChange={(e) => setAppointmentDetails({ ...appointmentDetails, animalType: e.target.value })}
                  required
                >
                  <option value="">Selecciona un tipo</option>
                  <option value="Perro">Perro</option>
                  <option value="Gato">Gato</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Descripción del Problema</label>
                <textarea
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                  value={appointmentDetails.description}
                  onChange={(e) => setAppointmentDetails({ ...appointmentDetails, description: e.target.value })}
                  required
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  className="bg-gray-500 text-white py-2 px-4 rounded-lg mr-2"
                  onClick={() => setModalOpen(false)}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 text-white py-2 px-4 rounded-lg"
                >
                  Agendar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentCalendar;
