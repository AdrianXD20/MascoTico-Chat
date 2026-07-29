import React, { useEffect, useState } from 'react'
import { FaArrowRight } from "react-icons/fa6";
import { Link } from 'react-router-dom';

const Sidebar = () => {
    const [popularBlog, setpopularBlog] =  useState([]);

    useEffect(() => {
        fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/blogs?page=1&limit=10`).then(res => res.json()).then(data => setpopularBlog(data.slice(0, 15)));
    }, [])
    return (
        <div className=''>
            <div>
                <h3 className='text-2xl font-semibold px-4'>Últimos Blogs</h3>
                <div>
                    {
                        popularBlog.slice(0, 5).map(blog => <div className='my-5 border-b-2 border-spacing-2 px-4' key={blog.id}>
                            <h4 className='font-medium mb-2'>{blog.titulo}</h4>
                            <Link to="/" className='inline-flex items-center pb-2 text-base hover:text-orange-500'>Leer ahora <FaArrowRight className='mt-1 ml-2'/></Link>
                        </div>)
                    }
                </div>
            </div>
            
            {/* Blogs Populares */}
            <div>
            <div>
                <h3 className='text-2xl font-semibold mt-20 px-4'>Populares Ahora</h3>
                <div>
                    {
                        popularBlog.slice(6, 10).map(blog => <div className='my-5 border-b-2 border-spacing-2 px-4' key={blog.id}>
                            <h4 className='font-medium mb-2'>{blog.titulo}</h4>
                            <Link to="/" className='inline-flex items-center pb-2 text-base hover:text-orange-500'>Leer ahora <FaArrowRight className='mt-1 ml-2'/></Link>
                        </div>)
                    }
                </div>
            </div>
            </div>
        </div>
    )
}

export default Sidebar