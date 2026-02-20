import React, { useState } from 'react';
import { useStock } from '../context/StockContext';
import toast from 'react-hot-toast';
import { RecipeItem } from '../types';

const Menu: React.FC = () => {
  const { addProduct, ingredients } = useStock();
  const [nome, setNome] = useState('');
  const [preco, setPreco] = useState('');
  const [descricao, setDescricao] = useState('');
  const [recipeItems, setRecipeItems] = useState<Omit<RecipeItem, 'produto_id'>[]>([]);

  const handleAddIngredient = () => {
    setRecipeItems([...recipeItems, { ingrediente_id: 0, quantidade_gasta: 0 }]);
  };

  const handleRemoveIngredient = (index: number) => {
    const newItems = [...recipeItems];
    newItems.splice(index, 1);
    setRecipeItems(newItems);
  };

  const handleRecipeItemChange = (index: number, field: keyof Omit<RecipeItem, 'produto_id'>, value: string | number) => {
    const newItems = [...recipeItems];
    (newItems[index] as any)[field] = value;
    setRecipeItems(newItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (nome && preco && descricao && recipeItems.length > 0) {
      await addProduct(nome, parseFloat(preco), descricao, recipeItems);
      setNome('');
      setPreco('');
      setDescricao('');
      setRecipeItems([]);
    } else {
      toast.error('Por favor, preencha todos os campos e adicione ao menos um ingrediente.');
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold text-orange-500 mb-4">Gerenciar Cardápio</h2>
      <form onSubmit={handleSubmit} className="bg-gray-800 p-6 rounded-lg shadow-md max-w-lg mx-auto">
        <div className="mb-4">
          <label className="block text-gray-400 mb-2">Nome do Lanche</label>
          <input 
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="w-full bg-gray-700 text-white p-2 rounded-md"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-400 mb-2">Preço</label>
          <input 
            type="number"
            step="0.01"
            value={preco}
            onChange={(e) => setPreco(e.target.value)}
            className="w-full bg-gray-700 text-white p-2 rounded-md"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-400 mb-2">Descrição</label>
          <textarea
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            className="w-full bg-gray-700 text-white p-2 rounded-md"
            rows={3}
            required
          ></textarea>
        </div>

        <div className="border-t border-gray-700 mt-6 pt-6">
          <h3 className="text-xl font-bold text-orange-500 mb-4">Ficha Técnica (Ingredientes)</h3>
          {recipeItems.map((item, index) => (
            <div key={index} className="flex items-center space-x-2 mb-2">
              <select 
                value={item.ingrediente_id}
                onChange={(e) => handleRecipeItemChange(index, 'ingrediente_id', parseInt(e.target.value, 10))}
                className="w-full bg-gray-700 text-white p-2 rounded-md"
              >
                <option value="0" disabled>Selecione um ingrediente</option>
                {ingredients.map(ing => (
                  <option key={ing.id} value={ing.id}>{ing.nome}</option>
                ))}
              </select>
              <input 
                type="number"
                placeholder="Qtd"
                value={item.quantidade_gasta}
                onChange={(e) => handleRecipeItemChange(index, 'quantidade_gasta', parseFloat(e.target.value))}
                className="w-24 bg-gray-700 text-white p-2 rounded-md"
              />
              <button type="button" onClick={() => handleRemoveIngredient(index)} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-2 rounded">
                X
              </button>
            </div>
          ))}
          <button type="button" onClick={handleAddIngredient} className="mt-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            + Adicionar Insumo
          </button>
        </div>

        <button type="submit" className="mt-6 bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded w-full">
          Salvar Produto
        </button>
      </form>
    </div>
  );
};

export default Menu;
