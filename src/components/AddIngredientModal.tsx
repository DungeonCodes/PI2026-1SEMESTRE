import React, { useState } from 'react';
import { useStock } from '../context/StockContext';
import toast from 'react-hot-toast';

interface AddIngredientModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddIngredientModal: React.FC<AddIngredientModalProps> = ({ isOpen, onClose }) => {
  const { addIngredient } = useStock();
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [minQuantity, setMinQuantity] = useState('');
  const [unit, setUnit] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name && quantity && minQuantity && unit) {
      await addIngredient(name, parseInt(quantity, 10), parseInt(minQuantity, 10), unit);
      onClose();
      setName('');
      setQuantity('');
      setMinQuantity('');
      setUnit('');
    } else {
      toast.error('Por favor, preencha todos os campos.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-orange-500">Novo Ingrediente</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-400 mb-2">Nome do Insumo</label>
            <input 
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-gray-700 text-white p-2 rounded-md"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-400 mb-2">Quantidade Inicial</label>
            <input 
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full bg-gray-700 text-white p-2 rounded-md"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-400 mb-2">Quantidade Mínima para Alerta</label>
            <input 
              type="number"
              value={minQuantity}
              onChange={(e) => setMinQuantity(e.target.value)}
              className="w-full bg-gray-700 text-white p-2 rounded-md"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-400 mb-2">Unidade de Medida (e.g., un, g, ml)</label>
            <input 
              type="text"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="w-full bg-gray-700 text-white p-2 rounded-md"
              placeholder="un, g, kg, ml, l"
              required
            />
          </div>
          <div className="flex justify-end space-x-4">
            <button type="button" onClick={onClose} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
              Cancelar
            </button>
            <button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded">
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddIngredientModal;
