// Datos GeoJSON de veterinarias en Mérida, Yucatán
// Estructura esperada por Maps_Config.jsx: FeatureCollection con features[]
// Cada feature: { properties: { Name, address, hour, images[] }, geometry: { coordinates: [lng, lat] } }

const stores = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: {
        Name: "Clínica Veterinaria Mérida Centro",
        address: "Calle 60 #450, Centro, Mérida, Yucatán",
        hour: "08:00 - 20:00",
        phone: "+52 999 123 4567",
        images: [],
      },
      geometry: { type: "Point", coordinates: [-89.6237, 20.9754] },
    },
    {
      type: "Feature",
      properties: {
        Name: "Hospital Veterinario del Sureste",
        address: "Av. Pérez Ponce #120, Mérida, Yucatán",
        hour: "00:00 - 24:00",
        phone: "+52 999 234 5678",
        images: [],
      },
      geometry: { type: "Point", coordinates: [-89.6412, 20.9698] },
    },
    {
      type: "Feature",
      properties: {
        Name: "Veterinaria Mascotas Felices",
        address: "Calle 21 #305 x 32 y 34, García Ginerés, Mérida",
        hour: "09:00 - 19:00",
        phone: "+52 999 345 6789",
        images: [],
      },
      geometry: { type: "Point", coordinates: [-89.6318, 20.9821] },
    },
    {
      type: "Feature",
      properties: {
        Name: "Clínica Animal Care",
        address: "Calle 47 #510, Fracc. Montejo, Mérida, Yucatán",
        hour: "08:00 - 21:00",
        phone: "+52 999 456 7890",
        images: [],
      },
      geometry: { type: "Point", coordinates: [-89.6189, 20.9912] },
    },
    {
      type: "Feature",
      properties: {
        Name: "VetMed Diagnóstico y Cirugía",
        address: "Calle 20 #188, Altabrisa, Mérida, Yucatán",
        hour: "08:00 - 20:00",
        phone: "+52 999 567 8901",
        images: [],
      },
      geometry: { type: "Point", coordinates: [-89.5998, 21.0031] },
    },
    {
      type: "Feature",
      properties: {
        Name: "Veterinaria Paws & Care",
        address: "Prolongación Montejo #155, Mérida, Yucatán",
        hour: "09:00 - 18:00",
        phone: "+52 999 678 9012",
        images: [],
      },
      geometry: { type: "Point", coordinates: [-89.6267, 21.0089] },
    },
    {
      type: "Feature",
      properties: {
        Name: "Clínica Veterinaria San Francisco",
        address: "Calle 65 #330 x 36 y 38, Mérida, Yucatán",
        hour: "08:00 - 19:00",
        phone: "+52 999 789 0123",
        images: [],
      },
      geometry: { type: "Point", coordinates: [-89.6153, 20.9633] },
    },
    {
      type: "Feature",
      properties: {
        Name: "Centro Veterinario Yucatán",
        address: "Av. Itzáes #400, Mérida, Yucatán",
        hour: "07:00 - 22:00",
        phone: "+52 999 890 1234",
        images: [],
      },
      geometry: { type: "Point", coordinates: [-89.6501, 20.9778] },
    },
  ],
};

export default stores;