import React, { useContext } from 'react';
import { CartContext } from '../../context/CartContext';
import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom'; // Importa el hook para navegación

const CartSlider = () => {
  const { cartItems, cartTotal, removeFromCart, updateQuantity, isCartOpen, toggleCart } = useContext(CartContext);
  const navigate = useNavigate(); // Inicializa el hook para navegación

  const handleCheckout = () => {
    navigate(`/paypal?total=${cartTotal.toFixed(2)}`); // Redirige a la ruta de PayPal con el total como query param
  };

  return (
    <div 
      className={`fixed top-0 right-0 w-80 h-full bg-white shadow-lg transition-transform duration-300 ${isCartOpen ? 'transform translate-x-0' : 'transform translate-x-full'} rounded-l-lg`}
      style={{ zIndex: 1000 }}
    >
      <div className="flex justify-between items-center p-4 bg-primary/80 text-white rounded-t-lg">
        <h2 className="font-bold text-lg">Tu Carrito</h2>
        <button onClick={toggleCart} className="p-2 text-white hover:text-gray-200">
          <X size={24} />
        </button>
      </div>

      <div className="overflow-y-auto p-4">
        {cartItems.length > 0 ? (
          cartItems.map(item => (
            <div key={item.id} className="flex items-center justify-between py-3 border-b">
              <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-lg" />
              <div className="ml-4 flex-1">
                <h3 className="font-semibold text-gray-700">{item.name}</h3>
                <p className="text-sm text-gray-500">${item.price} x {item.quantity}</p>
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => updateQuantity(item.id, parseInt(e.target.value, 10))}
                  className="w-16 mt-2 border rounded-lg text-center text-gray-700"
                />
              </div>
              <button
                onClick={() => removeFromCart(item.id)}
                className="p-2 text-red-500 hover:text-red-700 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center mt-4">Tu carrito está vacío.</p>
        )}
      </div>

      <div className="bg-gray-100 p-4 rounded-b-lg">
        <div className="flex justify-between items-center">
          <span className="font-bold text-gray-700">Total:</span>
          <span className="text-lg font-bold text-gray-800">${cartTotal.toFixed(2)}</span>
        </div>
        <button 
          onClick={handleCheckout} // Llama a la función para redirigir
          className="w-full bg-primary/80 text-white py-3 mt-4 hover:bg-primary/90 rounded-lg"
        >
          Finalizar compra
        </button>
      </div>
    </div>
  );
};

export default CartSlider;
