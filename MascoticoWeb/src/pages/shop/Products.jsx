import React, { useContext, useState, useEffect } from "react";
import btnIcon from "../../assets/button-icon.png";
import ProductCard from "./ProductCard";
import { ThemeContext } from "../../context/ThemeContext";
import axiosInstance from "../../utils/AxiosInstance";

const Products = ({ headline }) => {
  const { isDarkMode } = useContext(ThemeContext);

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [visibleProducts, setVisibleProducts] = useState(8);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      setError(null);
      try {
        const { data } = await axiosInstance.get("/productos");

        // Soporta: array directo, { rows: [...] }, { productos: [...] }
        let lista = [];
        if (Array.isArray(data)) {
          lista = data;
        } else if (data && Array.isArray(data.rows)) {
          lista = data.rows;
        } else if (data && Array.isArray(data.productos)) {
          lista = data.productos;
        } else {
          console.warn("Formato de productos no reconocido:", data);
        }

        setProducts(lista);

        // Construir categorías únicas dinámicamente desde la BD
        const cats = [
          ...new Set(
            lista
              .map((p) => p.categoria || p.category)
              .filter(Boolean)
              .map((c) => String(c).trim())
          ),
        ];
        setCategories(cats);
        if (cats.length > 0) setSelectedCategory(cats[0]);
      } catch (err) {
        console.error("Error al cargar productos:", err);
        setError("No se pudieron cargar los productos. Verifica que el servidor esté activo.");
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  // Filtrar por categoría seleccionada (campo 'categoria' de la BD)
  const filteredProducts =
    selectedCategory
      ? products.filter((p) => {
          const cat = String(p.categoria ?? p.category ?? "").trim();
          return cat === selectedCategory;
        })
      : products;

  const loadMoreProducts = () => {
    setVisibleProducts((prev) => prev + 8);
  };

  return (
    <div className={`${isDarkMode ? "bg-gray-900 text-white" : "bg-secondary-bg"}`}>
      <div className="section-container">
        <h2 className="text-4xl font-bold text-center my-8">{headline}</h2>

        {/* Pestañas de Categoría — generadas dinámicamente */}
        {categories.length > 0 && (
          <div className="bg-[#EEEEEE] max-w-lg mx-auto sm:rounded-full md:p-2.5 py-5 mb-16">
            <div className="flex flex-wrap items-center justify-center gap-3">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => {
                    setSelectedCategory(category);
                    setVisibleProducts(8);
                  }}
                  className={`py-1.5 sm:px-5 px-8 rounded-full transition-colors ${
                    selectedCategory === category
                      ? "bg-white text-primary shadow-sm font-semibold"
                      : "text-secondary hover:bg-primary hover:text-white"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Estados */}
        {loading && (
          <p className="text-center text-gray-400 italic py-10">
            Cargando la tienda de MascoTico...
          </p>
        )}

        {!loading && error && (
          <p className="text-center text-red-400 italic py-10">{error}</p>
        )}

        {/* Listado */}
        {!loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {filteredProducts.slice(0, visibleProducts).map((product, index) => (
              <ProductCard key={product.id || index} product={product} />
            ))}
          </div>
        )}

        {!loading && !error && filteredProducts.length === 0 && (
          <p className="text-center text-gray-400 italic py-6">
            No hay productos en esta categoría por ahora.
          </p>
        )}

        {/* Ver más */}
        {visibleProducts < filteredProducts.length && !loading && (
          <div className="flex justify-center items-center mt-8">
            <button
              onClick={loadMoreProducts}
              className="text-primary font-bold flex items-center px-4 py-2 rounded-full hover:text-white gap-1 hover:bg-secondary transition-colors"
            >
              Ver más
              <img src={btnIcon} alt="" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;