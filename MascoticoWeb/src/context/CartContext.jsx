import React, { createContext, useState } from 'react';
import Swal from 'sweetalert2';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]); // Array to hold cart items
  const [isCartOpen, setIsCartOpen] = useState(false); // Control visibility of the cart slider

  const addToCart = (product) => {
    const productExists = cartItems.some(item => item.id === product.id);

    if (productExists) {
      Swal.fire({
        icon: 'warning',
        title: 'Oops...',
        text: 'This product is already in your cart!',
        confirmButtonColor: '#3085d6',
      });
    } else {
      setCartItems(prevItems => [...prevItems, { ...product, quantity: 1 }]);
      Swal.fire({
        icon: 'success',
        title: 'Added!',
        text: 'Product has been added to your cart.',
        confirmButtonColor: '#3085d6',
      });
    }
  };

  const removeFromCart = (productId) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
    Swal.fire({
      icon: 'success',
      title: 'Removed!',
      text: 'Product has been removed from your cart.',
      confirmButtonColor: '#3085d6',
    });
  };

  const clearCart = () => {
    setCartItems([]);
    Swal.fire({
      icon: 'success',
      title: 'Cleared!',
      text: 'Your cart has been emptied.',
      confirmButtonColor: '#3085d6',
    });
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity < 1) {
      removeFromCart(productId);
    } else {
      setCartItems(prevItems =>
        prevItems.map(item =>
          item.id === productId ? { ...item, quantity } : item
        )
      );
    }
  };

  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0); // Total quantity of items
  const cartTotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0); // Total price

  const toggleCart = () => setIsCartOpen(!isCartOpen); // Toggle visibility of the cart

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        cartTotal,
        addToCart,
        removeFromCart,
        clearCart,
        updateQuantity,
        isCartOpen,
        toggleCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
