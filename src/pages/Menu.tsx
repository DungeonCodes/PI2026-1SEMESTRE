import React, { useState } from 'react';
import { useStock } from '../context/StockContext';
import { useConfig } from '../context/ConfigContext';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { RecipeItem } from '../types';

const Menu: React.FC = () => {
  const { addProduct, updateProduct, ingredients, products, deleteProduct } = useStock();
  const { settings } = useConfig();
  const [nome, setNome] = useState('');
  const [preco, setPreco] = useState('');
  const [descricao, setDescricao] = useState('');
  const [recipeItems, setRecipeItems] = useState<Omit<RecipeItem, 'produto_id'>[]>([]);
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

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
    setImageFile(null);
    setUploading(false);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este produto?')) {
      await deleteProduct(id);
    }
  };

  const handleUploadImage = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('produtos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('produtos')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast.error('Erro ao enviar imagem: ' + error.message);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (nome && preco && descricao && recipeItems.length > 0) {
      setUploading(true);
      let imageUrl = undefined;

      if (imageFile) {
        imageUrl = await handleUploadImage(imageFile);
        if (!imageUrl) {
          setUploading(false);
          return;
        }
      }

      if (editingProductId) {
        await updateProduct(editingProductId, nome, parseFloat(preco), descricao, recipeItems, imageUrl);
      } else {
        await addProduct(nome, parseFloat(preco), descricao, recipeItems, imageUrl);
      }
      resetForm();
    } else {
      toast.error('Por favor, preencha todos os campos e adicione ao menos um ingrediente.');
    }
  };

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <h2 
        className="text-2xl font-bold mb-6 transition-colors duration-300"
        style={{ color: settings?.cor_destaque || '#f97316' }}
      >
        Gerenciar Cardápio
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <form onSubmit={handleSubmit} className="bg-gray-800/80 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-white/5">
          <div className="flex justify-between items-center mb-6">
            <h3 
              className="text-xl font-bold transition-colors duration-300"
              style={{ color: settings?.cor_destaque || '#f97316' }}
            >
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
          <div className="space-y-4">
            <div>
              <label className="block text-gray-400 mb-2">Nome do Lanche</label>
              <input 
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full bg-gray-700/50 text-white p-2 rounded-lg border border-white/10 outline-none focus:border-orange-500 transition-colors"
                required
              />
            </div>
            <div>
              <label className="block text-gray-400 mb-2">Preço (R$)</label>
              <input 
                type="number"
                step="0.01"
                value={preco}
                onChange={(e) => setPreco(e.target.value)}
                className="w-full bg-gray-700/50 text-white p-2 rounded-lg border border-white/10 outline-none focus:border-orange-500 transition-colors"
                required
              />
            </div>
            <div>
              <label className="block text-gray-400 mb-2">Descrição</label>
              <textarea
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                className="w-full bg-gray-700/50 text-white p-2 rounded-lg border border-white/10 outline-none focus:border-orange-500 transition-colors"
                rows={3}
                required
              ></textarea>
            </div>

            <div>
              <label className="block text-gray-400 mb-2">Foto do Lanche</label>
              <input 
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                className="w-full text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gray-700 file:text-white hover:file:bg-gray-600 cursor-pointer"
              />
            </div>
          </div>

          <div className="border-t border-white/10 mt-8 pt-6">
            <h3 
              className="text-xl font-bold mb-4 transition-colors duration-300"
              style={{ color: settings?.cor_destaque || '#f97316' }}
            >
              Ficha Técnica (Ingredientes)
            </h3>
            <div className="space-y-3">
              {recipeItems.map((item, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <select 
                    value={item.ingrediente_id}
                    onChange={(e) => handleRecipeItemChange(index, 'ingrediente_id', parseInt(e.target.value, 10))}
                    className="flex-grow bg-gray-700/50 text-white p-2 rounded-lg border border-white/10 outline-none focus:border-orange-500 transition-colors"
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
                    className="w-24 bg-gray-700/50 text-white p-2 rounded-lg border border-white/10 outline-none focus:border-orange-500 transition-colors"
                  />
                  <button 
                    type="button" 
                    onClick={() => handleRemoveIngredient(index)} 
                    className="bg-red-600/20 hover:bg-red-600 text-red-500 hover:text-white p-2 rounded-lg transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
            <button 
              type="button" 
              onClick={handleAddIngredient} 
              className="mt-4 text-blue-400 hover:text-blue-300 text-sm font-medium flex items-center transition-colors"
            >
              <span className="mr-1">+</span> Adicionar Insumo
            </button>
          </div>

          <button 
            type="submit" 
            disabled={uploading}
            className="mt-8 text-white font-bold py-3 px-4 rounded-lg w-full transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] disabled:bg-gray-700 disabled:text-gray-500"
            style={{ backgroundColor: settings?.cor_destaque || '#f97316' }}
          >
            {uploading ? 'Enviando foto...' : (editingProductId ? 'Atualizar Produto' : 'Salvar Produto')}
          </button>
        </form>
        <div>
          <h3 
            className="text-xl font-bold mb-6 transition-colors duration-300"
            style={{ color: settings?.cor_destaque || '#f97316' }}
          >
            Lanches Cadastrados
          </h3>
          <div className="space-y-4">
            {products.map(product => (
              <div key={product.id} className="bg-gray-800/80 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-white/5 flex justify-between items-center transition-all hover:border-white/10">
                <div className="flex items-center space-x-4">
                  <img 
                    src={product.imagem_url} 
                    alt={product.nome} 
                    className="w-16 h-16 object-cover rounded-lg bg-gray-700"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <h4 className="font-bold">{product.nome}</h4>
                    <p className="text-sm text-gray-400 font-medium">R$ {product.preco.toFixed(2)}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => handleEdit(product)}
                    className="bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white font-bold py-1.5 px-3 rounded-lg transition-colors text-sm"
                  >
                    Editar
                  </button>
                  <button 
                    onClick={() => handleDelete(product.id)}
                    className="bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white font-bold py-1.5 px-3 rounded-lg transition-colors text-sm"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            ))}
            {products.length === 0 && (
              <p className="text-gray-500 italic text-center py-10">Nenhum lanche cadastrado.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Menu;
