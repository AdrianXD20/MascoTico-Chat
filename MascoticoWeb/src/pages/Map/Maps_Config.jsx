import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import mapboxgl from "mapbox-gl";
import { List, Loader2 } from "lucide-react";
import Swal from "sweetalert2";
import stores from "./STORE-LOCATOR/stores";
import { MERIDA_CENTER, filterStores } from "./utils";
import MapSearchBar from "./components/MapSearchBar";
import MapControls from "./components/MapControls";
import StoreSidebar from "./components/StoreSidebar";
import StoreDetailPanel from "./components/StoreDetailPanel";
import AppointmentModal from "./components/AppointmentModal";
import "./mapStyles.css";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

const MARKER_ICON =
  "https://cdn-icons-png.flaticon.com/512/2934/2934709.png";

const getStoreId = (store) =>
  `${store.properties.Name}-${store.geometry.coordinates.join(",")}`;

const MapsConfig = () => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const userMarkerRef = useRef(null);

  const [userLocation, setUserLocation] = useState(null);
  const [isLocating, setIsLocating] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [radius, setRadius] = useState(10);
  const [openNowOnly, setOpenNowOnly] = useState(false);
  const [mapStyle, setMapStyle] = useState("standard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(
    () => typeof window !== "undefined" && window.innerWidth >= 768
  );
  const [selectedStore, setSelectedStore] = useState(null);
  const [selectedStoreData, setSelectedStoreData] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [appointmentDate, setAppointmentDate] = useState(new Date());
  const [appointmentTime, setAppointmentTime] = useState("");
  const [animalDescription, setAnimalDescription] = useState("");
  const [animalType, setAnimalType] = useState("");

  const filteredStores = useMemo(
    () =>
      filterStores({
        stores: stores.features,
        userCoords: userLocation,
        radius,
        searchQuery,
        openNowOnly,
      }),
    [userLocation, radius, searchQuery, openNowOnly]
  );

  const locateUser = useCallback(() => {
    setIsLocating(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          setUserLocation([coords.longitude, coords.latitude]);
          setIsLocating(false);
        },
        () => {
          setUserLocation(MERIDA_CENTER);
          setIsLocating(false);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      setUserLocation(MERIDA_CENTER);
      setIsLocating(false);
    }
  }, []);

  useEffect(() => {
    locateUser();
  }, [locateUser]);

  const selectStore = useCallback((store) => {
    const id = getStoreId(store);
    setSelectedStore(id);
    setSelectedStoreData({
      ...store.properties,
      _coords: store.geometry.coordinates,
      _distance: store.distance,
    });
    setCurrentImageIndex(0);

    if (mapRef.current) {
      mapRef.current.flyTo({
        center: store.geometry.coordinates,
        zoom: 15,
        duration: 1200,
      });
    }
  }, []);

  const clearMarkers = useCallback(() => {
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];
  }, []);

  const updateMarkers = useCallback(() => {
    if (!mapRef.current) return;
    clearMarkers();

    filteredStores.forEach((store) => {
      const el = document.createElement("div");
      const id = getStoreId(store);
      el.className = `map-marker${selectedStore === id ? " selected" : ""}`;
      el.style.backgroundImage = `url('${MARKER_ICON}')`;
      el.addEventListener("click", (e) => {
        e.stopPropagation();
        selectStore(store);
      });

      const marker = new mapboxgl.Marker({ element: el, anchor: "bottom" })
        .setLngLat(store.geometry.coordinates)
        .addTo(mapRef.current);

      markersRef.current.push(marker);
    });
  }, [filteredStores, selectedStore, selectStore, clearMarkers]);

  useEffect(() => {
    if (!userLocation || !mapContainerRef.current || mapRef.current) return;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/standard",
      center: userLocation,
      zoom: 13,
      attributionControl: false,
    });

    map.addControl(new mapboxgl.NavigationControl(), "bottom-right");
    map.addControl(new mapboxgl.AttributionControl({ compact: true }), "bottom-right");

    const userEl = document.createElement("div");
    userEl.className = "map-user-marker";
    userMarkerRef.current = new mapboxgl.Marker({ element: userEl })
      .setLngLat(userLocation)
      .addTo(map);

    map.on("load", () => updateMarkers());
    mapRef.current = map;

    return () => {
      clearMarkers();
      userMarkerRef.current?.remove();
      map.remove();
      mapRef.current = null;
    };
  }, [userLocation]);

  useEffect(() => {
    updateMarkers();
  }, [updateMarkers]);

  useEffect(() => {
    if (userMarkerRef.current && userLocation) {
      userMarkerRef.current.setLngLat(userLocation);
    }
  }, [userLocation]);

  const handleLocateMe = () => {
    if (!mapRef.current || !userLocation) return;
    mapRef.current.flyTo({ center: userLocation, zoom: 14, duration: 1000 });
  };

  const handleToggleStyle = () => {
    if (!mapRef.current) return;
    const next = mapStyle === "standard" ? "satellite-streets-v12" : "standard";
    mapRef.current.setStyle(`mapbox://styles/mapbox/${next}`);
    setMapStyle(next === "standard" ? "standard" : "satellite");
    mapRef.current.once("style.load", () => updateMarkers());
  };

  const handleAppointmentSubmit = (e) => {
    e.preventDefault();
    setIsModalOpen(false);
    Swal.fire({
      icon: "success",
      title: "¡Cita agendada!",
      html: `<p>Tu cita en <strong>${selectedStoreData?.Name}</strong> ha sido registrada.</p>
             <p class="text-sm mt-2">${appointmentDate.toLocaleDateString("es-MX")} a las ${appointmentTime}</p>
             <p class="text-sm">Mascota: ${animalType} — ${animalDescription}</p>`,
      confirmButtonColor: "#008B86",
    });
    setAppointmentTime("");
    setAnimalDescription("");
    setAnimalType("");
  };

  const handleCloseDetail = () => {
    setSelectedStore(null);
    setSelectedStoreData(null);
  };

  return (
    <div className="fixed inset-0 w-full overflow-hidden bg-slate-100">
      <div ref={mapContainerRef} className="map-container" />

      {isLocating && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
          <div className="text-center map-loading-pulse">
            <Loader2 size={40} className="mx-auto text-primary animate-spin mb-3" />
            <p className="text-sm font-medium text-gray-600">
              Localizando veterinarias cerca de ti...
            </p>
          </div>
        </div>
      )}

      <MapSearchBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        radius={radius}
        onRadiusChange={setRadius}
        openNowOnly={openNowOnly}
        onOpenNowChange={setOpenNowOnly}
        totalCount={stores.features.length}
        filteredCount={filteredStores.length}
      />

      <MapControls
        onLocateMe={handleLocateMe}
        onToggleStyle={handleToggleStyle}
        onToggleFilters={() => setIsSidebarOpen(true)}
        mapStyle={mapStyle}
        isLocating={isLocating}
      />

      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="fixed top-[72px] right-4 z-20 map-glass w-11 h-11 rounded-xl shadow-lg flex items-center justify-center hover:bg-white transition-all hover:scale-105 md:hidden"
      >
        <List size={20} className="text-primary" />
      </button>

      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="hidden md:flex fixed top-1/2 -translate-y-1/2 z-40 items-center justify-center map-glass w-8 h-16 rounded-r-xl shadow-lg hover:bg-white transition-all"
        style={{ left: isSidebarOpen ? "380px" : "0px" }}
      >
        <span className="text-primary text-xs font-bold writing-mode-vertical">
          {isSidebarOpen ? "◀" : "▶"}
        </span>
      </button>

      <StoreSidebar
        stores={filteredStores}
        selectedStoreId={selectedStore}
        onSelectStore={selectStore}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {selectedStoreData && (
        <StoreDetailPanel
          store={selectedStoreData}
          distance={selectedStoreData._distance}
          currentImageIndex={currentImageIndex}
          onPrevImage={() =>
            setCurrentImageIndex(
              (i) =>
                (i - 1 + selectedStoreData.images.length) %
                selectedStoreData.images.length
            )
          }
          onNextImage={() =>
            setCurrentImageIndex(
              (i) => (i + 1) % selectedStoreData.images.length
            )
          }
          onClose={handleCloseDetail}
          onBookAppointment={() => setIsModalOpen(true)}
        />
      )}

      <AppointmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        storeName={selectedStoreData?.Name}
        appointmentDate={appointmentDate}
        onDateChange={setAppointmentDate}
        appointmentTime={appointmentTime}
        onTimeChange={setAppointmentTime}
        animalType={animalType}
        onAnimalTypeChange={setAnimalType}
        animalDescription={animalDescription}
        onDescriptionChange={setAnimalDescription}
        onSubmit={handleAppointmentSubmit}
      />
    </div>
  );
};

export default MapsConfig;
