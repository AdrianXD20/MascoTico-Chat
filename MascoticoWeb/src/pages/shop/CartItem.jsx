import React from 'react';

const CartItem = ({ item }) => {
  return (
    <div className="flex items-center justify-between border-b py-2">
      <img
        src={item.image}
        alt={item.name}
        className="w-16 h-16 object-cover rounded"
      />
      <div className="flex-1 ml-4">
        <h3 className="text-sm font-semibold">{item.name}</h3>
        <p className="text-gray-500 text-sm">Cantidad: {item.quantity}</p>
      </div>
      <p className="font-semibold">${item.price}</p>
    </div>
  );
};

export default CartItem;
