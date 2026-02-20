/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useStock } from '../context/StockContext';
import { MenuItem, OrderItem } from '../types';

const PDV: React.FC = () => {
  const { menuItems, addOrder } = useStock();
  const [cart, setCart] = useState<OrderItem[]>([]);

  const addToCart = (menuItem: MenuItem) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.menuItemId === menuItem.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.menuItemId === menuItem.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [
          ...prevCart,
          { menuItemId: menuItem.id, name: menuItem.name, quantity: 1, price: menuItem.price },
        ];
      }
    });
  };

  const placeOrder = () => {
    if (cart.length > 0) {
      addOrder({ items: cart });
      setCart([]);
    }
  };

  return (
    <div className="p-4 grid grid-cols-3 gap-4">
      <div className="col-span-2">
        <h2 className="text-2xl font-bold mb-4 text-orange-500">Cardápio</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {menuItems.map((item) => (
            <div key={item.id} className="bg-gray-800 p-4 rounded-lg shadow-md">
              <img src={item.image} alt={item.name} className="w-full h-32 object-cover rounded-md mb-4" referrerPolicy="no-referrer" />
              <h3 className="text-xl font-bold">{item.name}</h3>
              <p className="text-gray-400">{item.description}</p>
              <p className="text-lg font-bold mt-2">R$ {item.price.toFixed(2)}</p>
              <button
                onClick={() => addToCart(item)}
                className="mt-4 bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded">
                Adicionar ao Carrinho
              </button>
            </div>
          ))}
        </div>
      </div>
      <div className="col-span-1 bg-gray-900 p-4 rounded-lg">
        <h2 className="text-2xl font-bold mb-4 text-orange-500">Carrinho</h2>
        {cart.length === 0 ? (
          <p className="text-gray-400">Seu carrinho está vazio.</p>
        ) : (
          <div>
            <ul>
              {cart.map((item) => (
                <li key={item.menuItemId} className="flex justify-between items-center mb-2">
                  <span>
                    {item.quantity}x {item.name}
                  </span>
                  <span>R$ {(item.price * item.quantity).toFixed(2)}</span>
                </li>
              ))}
            </ul>
            <div className="border-t border-gray-700 mt-4 pt-4">
              <div className="flex justify-between items-center font-bold text-lg">
                <span>Total</span>
                <span>
                  R$ {
                    cart.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2)
                  }
                </span>
              </div>
            </div>
          </div>
        )}
        <button
          onClick={placeOrder}
          disabled={cart.length === 0}
          className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:bg-gray-600">
          Finalizar Pedido
        </button>
      </div>
    </div>
  );
};

export default PDV;
