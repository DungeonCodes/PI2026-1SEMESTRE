/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useStock } from '../context/StockContext';
import toast from 'react-hot-toast';

const Inventory: React.FC = () => {
  const { ingredients, restockIngredient } = useStock();
  const [restockAmounts, setRestockAmounts] = useState<{[key: number]: string}>({});

  const handleRestock = (ingredientId: number) => {
    const amount = parseInt(restockAmounts[ingredientId] || '0', 10);
    if (amount > 0) {
      restockIngredient(ingredientId, amount);
      toast.success('Estoque atualizado com sucesso!');
      setRestockAmounts(prev => ({...prev, [ingredientId]: ''}));
    } else {
      toast.error('Por favor, insira uma quantidade válida.');
    }
  };

  const handleAmountChange = (ingredientId: number, value: string) => {
    setRestockAmounts(prev => ({...prev, [ingredientId]: value}));
  }

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
            <div className="mt-4 flex items-center">
              <input 
                type="number"
                value={restockAmounts[ingredient.id] || ''}
                onChange={(e) => handleAmountChange(ingredient.id, e.target.value)}
                className="w-24 bg-gray-700 text-white p-1 rounded-md mr-2"
                placeholder="Qtd"
              />
              <button 
                onClick={() => handleRestock(ingredient.id)}
                className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-1 px-3 rounded"
              >
                + Repor
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Inventory;
