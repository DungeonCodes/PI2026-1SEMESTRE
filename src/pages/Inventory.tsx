/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useStock } from '../context/StockContext';

const Inventory: React.FC = () => {
  const { ingredients } = useStock();

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4 text-orange-500">Inventário</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {ingredients.map((ingredient) => (
          <div
            key={ingredient.id}
            className={`p-4 rounded-lg shadow-md ${
              ingredient.quantity < ingredient.minQuantity ? 'bg-red-900' : 'bg-gray-800'
            }`}>
            <h3 className="text-xl font-bold">{ingredient.name}</h3>
            <p className="text-gray-400">Quantidade: {ingredient.quantity}</p>
            <p className="text-gray-500">Mínimo: {ingredient.minQuantity}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Inventory;
