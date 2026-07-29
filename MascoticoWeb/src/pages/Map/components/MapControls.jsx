import { Crosshair, Layers, SlidersHorizontal } from "lucide-react";

const MapControls = ({
  onLocateMe,
  onToggleStyle,
  onToggleFilters,
  mapStyle,
  isLocating,
}) => (
  <div className="absolute top-24 right-4 z-20 flex flex-col gap-2">
    <button
      onClick={onLocateMe}
      disabled={isLocating}
      className="map-glass w-11 h-11 rounded-xl shadow-lg flex items-center justify-center hover:bg-white transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
      title="Mi ubicación"
    >
      <Crosshair
        size={20}
        className={`text-primary ${isLocating ? "animate-spin" : ""}`}
      />
    </button>
    <button
      onClick={onToggleStyle}
      className="map-glass w-11 h-11 rounded-xl shadow-lg flex items-center justify-center hover:bg-white transition-all hover:scale-105 active:scale-95"
      title={mapStyle === "standard" ? "Vista satélite" : "Vista calles"}
    >
      <Layers size={20} className="text-primary" />
    </button>
    <button
      onClick={onToggleFilters}
      className="map-glass w-11 h-11 rounded-xl shadow-lg flex items-center justify-center hover:bg-white transition-all hover:scale-105 active:scale-95 md:hidden"
      title="Filtros"
    >
      <SlidersHorizontal size={20} className="text-primary" />
    </button>
  </div>
);

export default MapControls;
