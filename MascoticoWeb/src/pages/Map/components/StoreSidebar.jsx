import { motion, AnimatePresence } from "framer-motion";
import { Clock, MapPin, ChevronRight, X, Stethoscope } from "lucide-react";
import { formatDistance, isOpenNow, isOpen24h } from "../utils";

const StoreCard = ({ store, isSelected, onSelect }) => {
  const { properties, distance } = store;
  const open = isOpenNow(properties.hour);
  const is24 = isOpen24h(properties.hour);

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      onClick={() => onSelect(store)}
      className={`group cursor-pointer rounded-xl p-3 transition-all duration-200 border ${
        isSelected
          ? "bg-primary/10 border-primary shadow-md"
          : "bg-white border-gray-100 hover:border-primary/30 hover:shadow-sm"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-sm text-gray-800 truncate">
              {properties.Name}
            </h3>
            {is24 && (
              <span className="shrink-0 px-1.5 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] font-bold rounded-full">
                24H
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 flex items-start gap-1 mt-1">
            <MapPin size={12} className="shrink-0 mt-0.5" />
            <span className="line-clamp-2">{properties.address}</span>
          </p>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <Clock size={11} />
              {properties.hour}
            </span>
            <span
              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                open
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-red-100 text-red-600"
              }`}
            >
              {open ? "Abierto" : "Cerrado"}
            </span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          {distance != null && (
            <span className="text-xs font-bold text-primary">
              {formatDistance(distance)}
            </span>
          )}
          <ChevronRight
            size={16}
            className="text-gray-300 group-hover:text-primary transition-colors"
          />
        </div>
      </div>
    </motion.li>
  );
};

const StoreSidebar = ({
  stores,
  selectedStoreId,
  onSelectStore,
  isOpen,
  onClose,
}) => (
  <>
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/30 z-30 md:hidden"
          onClick={onClose}
        />
      )}
    </AnimatePresence>

    <motion.aside
      initial={false}
      animate={{ x: isOpen ? 0 : "-100%" }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="fixed top-[60px] left-0 bottom-0 w-full sm:w-[380px] z-40 map-glass shadow-2xl flex flex-col"
    >
      <div className="p-4 border-b border-gray-100 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Stethoscope size={18} className="text-primary" />
          </div>
          <div>
            <h2 className="font-bold text-gray-800">Veterinarias</h2>
            <p className="text-xs text-gray-500">{stores.length} resultados</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="md:hidden w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center"
        >
          <X size={18} />
        </button>
      </div>

      <ul className="flex-1 overflow-y-auto map-sidebar-scroll p-3 space-y-2">
        <AnimatePresence mode="popLayout">
          {stores.length > 0 ? (
            stores.map((store) => (
              <StoreCard
                key={`${store.properties.Name}-${store.geometry.coordinates.join(",")}`}
                store={store}
                isSelected={
                  selectedStoreId ===
                  `${store.properties.Name}-${store.geometry.coordinates.join(",")}`
                }
                onSelect={onSelectStore}
              />
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 px-4"
            >
              <Stethoscope size={40} className="mx-auto text-gray-300 mb-3" />
              <p className="text-sm font-medium text-gray-600">
                No se encontraron veterinarias
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Intenta ampliar el radio o cambiar la búsqueda
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </ul>
    </motion.aside>
  </>
);

export default StoreSidebar;
