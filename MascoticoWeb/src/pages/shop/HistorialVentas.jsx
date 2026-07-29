import React, { useState, useEffect } from "react";
import axiosInstance from "../../utils/AxiosInstance";
import { ShoppingBag, ChevronDown, ChevronUp, Package, Calendar, Receipt, Tag } from "lucide-react";

// ── Utilidades ───────────────────────────────────────────────────────────────
const formatMXN = (n) =>
  `$${Number(n ?? 0).toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const estadoStyle = {
  completado: "bg-green-100 text-green-700",
  pendiente:  "bg-yellow-100 text-yellow-700",
  cancelado:  "bg-red-100 text-red-600",
};

// ── Fila de un producto dentro de la venta ────────────────────────────────────
const DetalleRow = ({ item }) => (
  <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-gray-50 text-sm">
    <div className="flex items-center gap-2">
      <Package size={14} className="text-primary shrink-0" />
      <span className="text-gray-700 font-medium">
        {item.nombre_producto || item.Producto?.nombre || `Producto #${item.id_producto}`}
      </span>
    </div>
    <div className="flex items-center gap-4 text-gray-500 shrink-0">
      <span>x{item.cantidad}</span>
      <span className="font-semibold text-gray-800 w-24 text-right">{formatMXN(item.subtotal)}</span>
    </div>
  </div>
);

// ── Tarjeta de venta ──────────────────────────────────────────────────────────
const VentaCard = ({ venta }) => {
  const [open, setOpen] = useState(false);
  const estadoKey = (venta.estado || "").toLowerCase();
  const badgeClass = estadoStyle[estadoKey] || "bg-gray-100 text-gray-600";

  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden transition-all duration-200 hover:shadow-lg">
      {/* Cabecera */}
      <button
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center justify-between px-5 py-4 text-left"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <Receipt size={18} className="text-primary" />
          </div>
          <div>
            <p className="font-semibold text-gray-800 text-sm">Orden #{venta.id}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <Calendar size={12} className="text-gray-400" />
              <p className="text-xs text-gray-400">
                {venta.fecha_creacion
                  ? new Date(venta.fecha_creacion).toLocaleDateString("es-MX", {
                      day: "2-digit", month: "long", year: "numeric",
                    })
                  : "Sin fecha"}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <span className={`text-xs px-3 py-1 rounded-full font-medium capitalize ${badgeClass}`}>
            {venta.estado || "Sin estado"}
          </span>
          <p className="font-bold text-gray-800">{formatMXN(venta.total)}</p>
          {open ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
        </div>
      </button>

      {/* Detalle expandible */}
      {open && (
        <div className="px-5 pb-4 space-y-2 border-t border-gray-100 pt-3">
          {venta.detalles && venta.detalles.length > 0 ? (
            venta.detalles.map((item, i) => <DetalleRow key={i} item={item} />)
          ) : (
            <p className="text-sm text-gray-400 italic py-2">Sin detalle de productos disponible.</p>
          )}
          <div className="flex justify-end pt-2 border-t border-dashed border-gray-200 mt-2">
            <p className="text-sm font-bold text-gray-700">
              Total pagado: <span className="text-primary">{formatMXN(venta.total)}</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Componente principal ───────────────────────────────────────────────────────
const HistorialVentas = () => {
  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchVentas() {
      setLoading(true);
      setError(null);
      try {
        // Obtener usuario del localStorage
        const raw = localStorage.getItem("user");
        const user = raw ? JSON.parse(raw) : null;
        const userId = user?.id;

        if (!userId) {
          setError("Debes iniciar sesión para ver tu historial de compras.");
          return;
        }

        // Intentar rutas comunes; ajusta si tu backend usa otra
        const { data } = await axiosInstance.get(`/ventas/usuario/${userId}`);

        let lista = [];
        if (Array.isArray(data)) {
          lista = data;
        } else if (data && Array.isArray(data.ventas)) {
          lista = data.ventas;
        } else if (data && Array.isArray(data.rows)) {
          lista = data.rows;
        }

        setVentas(lista);
      } catch (err) {
        console.error("Error al cargar historial de ventas:", err);
        if (err.response?.status === 404) {
          setVentas([]); // No hay ventas todavía
        } else {
          setError("No se pudo cargar el historial. Verifica que el servidor esté activo.");
        }
      } finally {
        setLoading(false);
      }
    }
    fetchVentas();
  }, []);

  // ── Render ──────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-gray-400">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
        <p className="italic">Cargando historial de compras...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <ShoppingBag size={48} className="text-gray-300 mb-4" />
        <p className="text-red-400 font-medium">{error}</p>
      </div>
    );
  }

  if (ventas.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-gray-400 text-center">
        <ShoppingBag size={56} className="mb-4 opacity-30" />
        <p className="text-lg font-semibold text-gray-500">Sin compras aún</p>
        <p className="text-sm mt-1">Aquí aparecerán tus pedidos una vez que realices tu primera compra. 🛍️</p>
      </div>
    );
  }

  const totalGastado = ventas.reduce((acc, v) => acc + Number(v.total ?? 0), 0);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Resumen */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-primary/10 rounded-2xl p-4 text-center">
          <p className="text-3xl font-extrabold text-primary">{ventas.length}</p>
          <p className="text-xs text-gray-500 mt-1">Órdenes realizadas</p>
        </div>
        <div className="bg-green-50 rounded-2xl p-4 text-center">
          <p className="text-2xl font-extrabold text-green-600">{formatMXN(totalGastado)}</p>
          <p className="text-xs text-gray-500 mt-1">Total gastado</p>
        </div>
        <div className="bg-yellow-50 rounded-2xl p-4 text-center col-span-2 sm:col-span-1">
          <p className="text-3xl font-extrabold text-yellow-600">
            {ventas.filter((v) => (v.estado || "").toLowerCase() === "pendiente").length}
          </p>
          <p className="text-xs text-gray-500 mt-1">En proceso</p>
        </div>
      </div>

      {/* Lista de ventas */}
      <div className="space-y-4">
        {ventas.map((venta) => (
          <VentaCard key={venta.id} venta={venta} />
        ))}
      </div>
    </div>
  );
};

export default HistorialVentas;
