export const MERIDA_CENTER = [-89.616557, 20.967748];

export const RADIUS_OPTIONS = [
  { value: 5, label: "5 km" },
  { value: 10, label: "10 km" },
  { value: 25, label: "25 km" },
  { value: 0, label: "Todos" },
];

export const getDistance = (coord1, coord2) => {
  const toRad = (value) => (value * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(coord2[1] - coord1[1]);
  const dLon = toRad(coord2[0] - coord1[0]);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(coord1[1])) *
      Math.cos(toRad(coord2[1])) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export const formatDistance = (km) => {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
};

export const isOpen24h = (hour) =>
  hour?.toLowerCase().includes("24") ?? false;

export const isOpenNow = (hour) => {
  if (!hour) return false;
  if (isOpen24h(hour)) return true;

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const match = hour.match(/(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})/);
  if (!match) return false;

  const openMinutes = parseInt(match[1]) * 60 + parseInt(match[2]);
  const closeMinutes = parseInt(match[3]) * 60 + parseInt(match[4]);
  return currentMinutes >= openMinutes && currentMinutes <= closeMinutes;
};

export const enrichStores = (features, userCoords) =>
  features
    .map((store) => ({
      ...store,
      distance: userCoords
        ? getDistance(userCoords, store.geometry.coordinates)
        : null,
    }))
    .sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0));

export const filterStores = ({
  stores,
  userCoords,
  radius,
  searchQuery,
  openNowOnly,
}) => {
  let result = enrichStores(stores, userCoords);

  if (radius > 0 && userCoords) {
    result = result.filter((s) => s.distance <= radius);
  }

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    result = result.filter(
      (s) =>
        s.properties.Name.toLowerCase().includes(q) ||
        s.properties.address.toLowerCase().includes(q)
    );
  }

  if (openNowOnly) {
    result = result.filter((s) => isOpenNow(s.properties.hour));
  }

  return result;
};

export const buildDirectionsUrl = (coords, name) => {
  const [lng, lat] = coords;
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=${encodeURIComponent(name)}`;
};

export const buildWazeUrl = (coords) => {
  const [lng, lat] = coords;
  return `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`;
};
