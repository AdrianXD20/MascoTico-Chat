import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Clock,
  MapPin,
  Navigation,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { buildDirectionsUrl, buildWazeUrl, isOpenNow, isOpen24h } from "../utils";

const StoreDetailPanel = ({
  store,
  distance,
  currentImageIndex,
  onPrevImage,
  onNextImage,
  onClose,
  onBookAppointment,
}) => {
  if (!store) return null;

  const open = isOpenNow(store.hour);
  const is24 = isOpen24h(store.hour);
  const coords = store._coords;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        transition={{ type: "spring", damping: 28, stiffness: 300 }}
        className="fixed bottom-0 left-0 right-0 z-50 md:bottom-6 md:left-auto md:right-6 md:w-[440px]"
      >
        <div className="map-glass-dark rounded-t-3xl md:rounded-3xl shadow-2xl overflow-hidden">
          <div className="relative h-44 md:h-48">
            <img
              src={store.images[currentImageIndex]}
              alt={store.Name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/30 to-transparent" />

            <button
              onClick={onClose}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/60 transition-colors"
            >
              <X size={16} />
            </button>

            {store.images.length > 1 && (
              <>
                <button
                  onClick={onPrevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/60"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={onNextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/60"
                >
                  <ChevronRight size={16} />
                </button>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {store.images.map((_, i) => (
                    <div
                      key={i}
                      className={`w-1.5 h-1.5 rounded-full transition-all ${
                        i === currentImageIndex
                          ? "bg-white w-4"
                          : "bg-white/50"
                      }`}
                    />
                  ))}
                </div>
              </>
            )}

            <div className="absolute bottom-3 left-4 right-4">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-bold text-white truncate">
                  {store.Name}
                </h3>
                {is24 && (
                  <span className="shrink-0 px-2 py-0.5 bg-indigo-500/80 text-white text-[10px] font-bold rounded-full">
                    24H
                  </span>
                )}
              </div>
              {distance != null && (
                <span className="text-xs text-teal-300 font-medium">
                  A {distance < 1 ? `${Math.round(distance * 1000)} m` : `${distance.toFixed(1)} km`} de ti
                </span>
              )}
            </div>
          </div>

          <div className="p-4 space-y-3">
            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                  open
                    ? "bg-emerald-500/20 text-emerald-400"
                    : "bg-red-500/20 text-red-400"
                }`}
              >
                {open ? "Abierto ahora" : "Cerrado"}
              </span>
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <Clock size={12} />
                {store.hour}
              </span>
            </div>

            <p className="text-xs text-gray-400 flex items-start gap-1.5">
              <MapPin size={13} className="shrink-0 mt-0.5" />
              {store.address}
            </p>

            <p className="text-sm text-gray-300 leading-relaxed">
              {store.description}
            </p>

            <div className="flex gap-2 pt-1">
              {coords && (
                <>
                  <a
                    href={buildDirectionsUrl(coords, store.Name)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-white/10 text-white text-xs font-medium hover:bg-white/20 transition-colors"
                  >
                    <Navigation size={14} />
                    Cómo llegar
                    <ExternalLink size={10} className="opacity-50" />
                  </a>
                  <a
                    href={buildWazeUrl(coords)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/10 text-white text-xs font-medium hover:bg-white/20 transition-colors"
                  >
                    Waze
                  </a>
                </>
              )}
              <button
                onClick={onBookAppointment}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/30"
              >
                <Calendar size={14} />
                Agendar cita
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default StoreDetailPanel;
