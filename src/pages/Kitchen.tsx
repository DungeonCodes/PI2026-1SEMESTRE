/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useStock } from '../context/StockContext';
import { MenuItem } from '../types';

const Kitchen: React.FC = () => {
  const { orders, updateOrderStatus, menuItems } = useStock();

  const getMenuItemName = (menuItemId: number) => {
    const menuItem = menuItems.find((item: MenuItem) => item.id === menuItemId);
    return menuItem ? menuItem.name : 'Item não encontrado';
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4 text-orange-500">Pedidos na Cozinha</h2>
      <div>
        <h3 className="text-xl font-bold mb-2 text-yellow-500">Pendentes</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {orders
            .filter((order) => order.status === 'Pendente')
            .map((order) => (
              <div key={order.id} className="bg-gray-800 p-4 rounded-lg shadow-md">
                <h3 className="text-xl font-bold">Pedido #{order.id}</h3>
                <ul>
                  {order.items.map((item) => (
                    <li key={item.menuItemId}>
                      {item.quantity}x {getMenuItemName(item.menuItemId)}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => updateOrderStatus(order.id, 'Pronto')}
                  className="mt-4 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                  Marcar como Pronto
                </button>
              </div>
            ))}
        </div>
        <h3 className="text-xl font-bold mb-2 text-green-500">Prontos</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {orders
            .filter((order) => order.status === 'Pronto')
            .map((order) => (
              <div key={order.id} className="bg-green-900 p-4 rounded-lg shadow-md">
                <h3 className="text-xl font-bold">Pedido #{order.id}</h3>
                <ul>
                  {order.items.map((item) => (
                    <li key={item.menuItemId}>
                      {item.quantity}x {getMenuItemName(item.menuItemId)}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => updateOrderStatus(order.id, 'Entregue')}
                  className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                  Marcar como Entregue
                </button>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default Kitchen;
