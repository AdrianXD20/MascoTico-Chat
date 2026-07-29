import React, { useState } from "react";
import bannerImg from "../../assets/banner.png";
import Products from "./Products";
import HistorialVentas from "./HistorialVentas";
import { ShoppingBag, History } from "lucide-react";

const TABS = [
  { id: "tienda",    label: "Tienda",           Icon: ShoppingBag },
  { id: "historial", label: "Mis Compras",      Icon: History },
];

const ShopPage = () => {
  const [activeTab, setActiveTab] = useState("tienda");

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Banner */}
      <div
        className="w-full h-[340px] bg-cover bg-center flex flex-col items-center justify-center text-white relative"
        style={{ backgroundImage: `url(${bannerImg})` }}
      >
        <div className="absolute inset-0 bg-black/35" />
        <div className="relative z-10 text-center">
          <h1 className="text-5xl font-extrabold drop-shadow-lg tracking-tight">
            {activeTab === "tienda" ? "Compra nuestros productos" : "Mis Compras"}
          </h1>
          <p className="mt-2 text-white/80 text-lg">
            {activeTab === "tienda"
              ? "Encuentra todo lo que tu mascota necesita"
              : "Revisa el detalle de tus pedidos"}
          </p>
        </div>
      </div>

      {/* Pestañas de navegación */}
      <div className="sticky top-0 z-20 bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 flex gap-1 py-2">
          {TABS.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 ${
                activeTab === id
                  ? "bg-primary text-white shadow-md scale-[1.02]"
                  : "text-gray-500 hover:text-primary hover:bg-primary/5"
              }`}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Contenido */}
      <div className="transition-all duration-300">
        {activeTab === "tienda" && (
          <Products headline="¿Cuál es tu elección?" />
        )}
        {activeTab === "historial" && (
          <HistorialVentas />
        )}
      </div>
    </div>
  );
};

export default ShopPage;