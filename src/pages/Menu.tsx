import React, { useState } from 'react';
import { useStock } from '../context/StockContext';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { RecipeItem } from '../types';

const Menu: React.FC = () => {
  const { addProduct, updateProduct, ingredients, products, deleteProduct } = useStock();
  const [nome, setNome] = useState('');
  const [preco, setPreco] = useState('');
  const [descricao, setDescricao] = useState('');
  const [recipeItems, setRecipeItems] = useState<Omit<RecipeItem, 'produto_id'>[]>([]);
  const [editingProductId, setEditingProductId] = useState<number | null>(null);

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

  const handleEdit = async (product: any) => {
    setEditingProductId(product.id);
    setNome(product.nome);
    setPreco(product.preco.toString());
    setDescricao(product.descricao);

    // Fetch recipe items for this product
    const { data, error } = await supabase
      .from('ficha_tecnica')
      .select('ingrediente_id, quantidade_gasta')
      .eq('produto_id', product.id);

    if (error) {
      console.error('Error fetching recipe:', error);
      toast.error('Erro ao carregar ficha técnica.');
    } else {
      setRecipeItems(data || []);
    }
  };

  const resetForm = () => {
    setEditingProductId(null);
    setNome('');
    setPreco('');
    setDescricao('');
    setRecipeItems([]);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este produto?')) {
      await deleteProduct(id);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (nome && preco && descricao && recipeItems.length > 0) {
      if (editingProductId) {
        await updateProduct(editingProductId, nome, parseFloat(preco), descricao, recipeItems);
      } else {
        await addProduct(nome, parseFloat(preco), descricao, recipeItems);
      }
      resetForm();
    } else {
      toast.error('Por favor, preencha todos os campos e adicione ao menos um ingrediente.');
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold text-orange-500 mb-4">Gerenciar Cardápio</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <form onSubmit={handleSubmit} className="bg-gray-800 p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-orange-500">
              {editingProductId ? 'Editar Lanche' : 'Adicionar Novo Lanche'}
            </h3>
            {editingProductId && (
              <button 
                type="button" 
                onClick={resetForm}
                className="text-sm text-gray-400 hover:text-white underline"
              >
                Cancelar Edição
              </button>
            )}
          </div>
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
            {editingProductId ? 'Atualizar Produto' : 'Salvar Produto'}
          </button>
        </form>
        <div>
          <h3 className="text-xl font-bold text-orange-500 mb-4">Lanches Cadastrados</h3>
          <div className="grid grid-cols-1 gap-4">
            {products.map(product => (
              <div key={product.id} className="bg-gray-800 p-4 rounded-lg shadow-md flex justify-between items-center">
                <div>
                  <h4 className="font-bold">{product.nome}</h4>
                  <p className="text-sm text-gray-400">R$ {product.preco.toFixed(2)}</p>
                </div>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => handleEdit(product)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded"
                  >
                    Editar
                  </button>
                  <button 
                    onClick={() => handleDelete(product.id)}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 rounded"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Menu;
