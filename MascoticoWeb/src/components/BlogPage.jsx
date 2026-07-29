import React, { useState, useEffect } from "react";
import CategorySelection from "./categorySelection.jsx";
import Pagination from "./Pagination";
import BlogCards from "./BlogCard";
import Sidebar from "./Sidebar.jsx";

const BlogPage = () => {
    const [blogs, setBlogs] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 12; // Número de blogs por página
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [activeCategory, setActiveCategory] = useState(null);

    useEffect(() => {
        async function fetchBlogs() {
            // El backend ya se encarga de paginar
            const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
            let url = `${apiBase}/blogs?page=${currentPage}&limit=${pageSize}`;
            // Si hay categoría seleccionada, la agregamos al fetch del backend
            if (selectedCategory) {
                url += `&category=${selectedCategory}`;
            }
            
            try {
                const response = await fetch(url);
                const data = await response.json();
                setBlogs(data);
            } catch (error) {
                console.error("Error cargando los blogs de MascoTico:", error);
            }
        }

        fetchBlogs();
    }, [currentPage, selectedCategory]); // Quitamos pageSize del arreglo porque es constante

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const handleCategoryChange = (category) => {
        setSelectedCategory(category);
        setCurrentPage(1); // Resetea a la página 1 al cambiar de categoría
        setActiveCategory(category);
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Componente de Selección de Categorías */}
            <div className="mb-8">
                <CategorySelection onSelectCategory={handleCategoryChange} activeCategory={activeCategory} />
            </div>

            {/* Contenedor Principal: Tarjetas + Sidebar */}
            <div className="flex flex-col lg:flex-row gap-12">
                <div className="lg:w-3/4">
                    <BlogCards blogs={blogs} />
                </div>
                
                <div className="lg:w-1/4">
                    <Sidebar />
                </div>
            </div>

            {/* Componente de Paginación */}
            <div className="mt-12">
                <Pagination
                    currentPage={currentPage}
                    onPageChange={handlePageChange}
                    blogs={blogs}
                    pageSize={pageSize}
                />
            </div>
        </div>
    );
};

export default BlogPage;