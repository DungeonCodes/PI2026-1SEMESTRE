import React, { useState } from 'react';
import { useStock } from '../context/StockContext';
import { useConfig } from '../context/ConfigContext';
import toast from 'react-hot-toast';
import AddIngredientModal from '../components/AddIngredientModal';
import EditIngredientModal from '../components/EditIngredientModal';
import { Ingredient } from '../types';

const Inventory: React.FC = () => {
  const { ingredients, restockIngredient, deleteIngredient } = useStock();
  const { settings } = useConfig();
  const [restockAmounts, setRestockAmounts] = useState<{[key: number]: string}>({});
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null);

  const handleRestock = async (ingredientId: number) => {
    const amount = parseInt(restockAmounts[ingredientId] || '0', 10);
    if (amount > 0) {
      await restockIngredient(ingredientId, amount);
      toast.success('Estoque atualizado com sucesso!');
      setRestockAmounts(prev => ({...prev, [ingredientId]: ''}));
    } else {
      toast.error('Por favor, insira uma quantidade válida.');
    }
  };

  const handleAmountChange = (ingredientId: number, value: string) => {
    setRestockAmounts(prev => ({...prev, [ingredientId]: value}));
  }

  const handleDelete = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este ingrediente?')) {
      await deleteIngredient(id);
    }
  };

  const handleEdit = (ingredient: Ingredient) => {
    setSelectedIngredient(ingredient);
    setIsEditModalOpen(true);
  };

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 
          className="text-2xl font-bold transition-colors duration-300"
          style={{ color: settings?.cor_destaque || '#f97316' }}
        >
          Inventário
        </h2>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="text-white font-bold py-2 px-4 rounded-lg transition-all duration-200 hover:scale-[1.02]"
          style={{ backgroundColor: settings?.cor_destaque || '#f97316' }}
        >
          + Novo Ingrediente
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ingredients.map((ingredient) => (
          <div
            key={ingredient.id}
            className={`p-6 rounded-xl shadow-lg border transition-all duration-300 ${
              ingredient.quantidade_atual < ingredient.quantidade_minima 
                ? 'bg-red-900/40 border-red-500/30' 
                : 'bg-gray-800/80 border-white/5 backdrop-blur-sm'
            }`}>
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold">{ingredient.nome}</h3>
              <div className="flex space-x-3">
                <button 
                  onClick={() => handleEdit(ingredient)}
                  className="text-blue-400 hover:text-blue-300 transition-colors"
                  title="Editar"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                </button>
                <button 
                  onClick={() => handleDelete(ingredient.id)}
                  className="text-red-400 hover:text-red-300 transition-colors"
                  title="Excluir"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="space-y-1 mb-6">
              <p className="text-gray-400 flex justify-between">
                <span>Estoque:</span>
                <span className="font-bold text-white">{ingredient.quantidade_atual} {ingredient.unidade_medida}</span>
              </p>
              <p className="text-gray-500 text-sm flex justify-between">
                <span>Mínimo:</span>
                <span>{ingredient.quantidade_minima} {ingredient.unidade_medida}</span>
              </p>
            </div>
            <div className="mt-4 flex items-center space-x-2">
              <input 
                type="number"
                value={restockAmounts[ingredient.id] || ''}
                onChange={(e) => handleAmountChange(ingredient.id, e.target.value)}
                className="flex-grow bg-gray-700/50 text-white p-2 rounded-lg border border-white/10 outline-none focus:border-orange-500 transition-colors"
                placeholder="Qtd"
              />
              <button 
                onClick={() => handleRestock(ingredient.id)}
                className="text-white font-bold py-2 px-4 rounded-lg transition-all duration-200"
                style={{ backgroundColor: settings?.cor_destaque || '#f97316' }}
              >
                Repor
              </button>
            </div>
          </div>
        ))}
      </div>
      <AddIngredientModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
      <EditIngredientModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        ingredient={selectedIngredient} 
      />
    </div>
  );
};

export default Inventory;
