import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from './pages/home/Home.jsx';
import About from './pages/about/About.jsx';
import Contact from './pages/contact/Contact.jsx';
import ShopPage from './pages/shop/ShopPage.jsx';
import Mapsconfig from './pages/Map/Maps_Config.jsx';
import SingleBlog from '../src/pages/blogs/singleBlog.jsx';
import { Blogs } from '../src/pages/blogs/Blogs.jsx';
import Paypal from './pages/shop/paypal.jsx';
import Login from './pages/account/Login.jsx'
import Signup from './pages/account/SignUp.jsx'
import Dates from './pages/dates/Dates.jsx'
import Modal from './components/AppointmentModal.jsx';

import 'sweetalert2/dist/sweetalert2.min.css';

const router = createBrowserRouter([
  {
    path: "/",
    element: <App/>,
    children: [
      {
        path: "/",
        element: <Home/>
      },
      {
        path: "/shop",
        element: <ShopPage/>
      },
      {
        path: '/about',
        element: <About/>
      },
      {
        path: "/contact",
        element: <Contact/>
      },
      {
        path: "/Map",
        element: <Mapsconfig/>
      },
      {
        path: '/blogs/:id',
        element: <SingleBlog />,
        loader: async ({ params }) => {
          try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/blogs/${params.id}`);
            if (!response.ok) {
              throw new Error('Error al obtener el blog');
            }
            const data = await response.json();
            return data;
          } catch (error) {
            console.error('Error en el loader:', error);
            return null;
          }
        },
      },
      {
        path: '/blogs',
        element: <Blogs />,
      },
      {
        path: '/paypal',
        element: <Paypal/>,
      },
      {
        path: '/login',
        element: <Login/>
      },
      {
        path: '/signUp',
        element: <Signup/>
      },
      {
        path: '/dates',
        element: <Dates/>    
      },
      {
        path: '/perfil', // Creamos el alias /perfil que apunta a tus citas
        element: <Dates/>    
      },
      {
        path: '/Modal',
        element: <Modal/>
      }
    ]
  },
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)