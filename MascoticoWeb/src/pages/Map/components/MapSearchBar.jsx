import { Search, X } from "lucide-react";
import { RADIUS_OPTIONS } from "../utils";

const MapSearchBar = ({
  searchQuery,
  onSearchChange,
  radius,
  onRadiusChange,
  openNowOnly,
  onOpenNowChange,
  totalCount,
  filteredCount,
}) => (
  <div className="absolute top-[72px] left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-xl z-20">
    <div className="map-glass rounded-2xl shadow-xl p-3">
      <div className="relative">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          placeholder="Buscar veterinaria por nombre o dirección..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-10 py-2.5 bg-gray-50/80 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/30 transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X size={16} />
          </button>
        )}
      </div>

      <div className="flex items-center justify-center gap-2 mt-3 flex-wrap">
        {RADIUS_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onRadiusChange(opt.value)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
              radius === opt.value
                ? "bg-primary text-white shadow-md"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {opt.label}
          </button>
        ))}
        <button
          onClick={() => onOpenNowChange(!openNowOnly)}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
            openNowOnly
              ? "bg-emerald-500 text-white shadow-md"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          Abierto ahora
        </button>
      </div>

      <p className="text-xs text-gray-500 mt-2 text-center">
        {filteredCount} de {totalCount} veterinarias
        {radius > 0 ? ` en ${radius} km` : ""}
      </p>
    </div>
  </div>
);

export default MapSearchBar;
