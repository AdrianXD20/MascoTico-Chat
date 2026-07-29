import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import './App.css';
import Navbar from './components/Navbar.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { CartProvider } from './context/CartContext.jsx';
import Footer from './components/Footer.jsx';
import CartSlider from './pages/shop/cartslider.jsx';
import Chat from './components/chat.jsx';

function App() {
  const navigate = useNavigate();
  const location = useLocation();

  // Oculta el Footer en la página del mapa
  const isMapPage = location.pathname === '/Map';

  // Función global para que el Chat pueda mover las rutas de la App
  const cambiarRutaDesdeIA = (destino) => {
    if (destino === 'tienda') navigate('/shop');
    else if (destino === 'blogs') navigate('/blogs');
    else if (destino === 'perfil') navigate('/perfil'); // Ajusta si tu ruta de perfil es distinta
    else if (destino === 'inicio') navigate('/');
    else if (destino === 'citas') navigate('/perfil')
  };

  return (
    <ThemeProvider>
      <CartProvider>
        <Navbar />
        <main className={isMapPage ? '' : 'min-h-screen'}>
          <Outlet />
        </main>
        {!isMapPage && <Footer />}
        <CartSlider />
        {/* Le inyectamos la función de navegación al Chat */}
        <Chat alNavegar={cambiarRutaDesdeIA} /> 
      </CartProvider>
    </ThemeProvider>
  );
}

export default App;