import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Ingredient, Product, Order, OrderItem, RecipeItem, StockMovement } from '../types';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

interface StockContextType {
  ingredients: Ingredient[];
  products: Product[];
  orders: Order[];
  movements: StockMovement[];
  addOrder: (order: Omit<Order, 'id' | 'criado_em' | 'items'>, items: Omit<OrderItem, 'id' | 'pedido_id'>[]) => Promise<void>;
  updateOrderStatus: (orderId: number, status: 'Pendente' | 'Pronto' | 'Entregue') => Promise<void>;
  restockIngredient: (ingredientId: number, amount: number) => Promise<void>;
  addIngredient: (name: string, quantity: number, minQuantity: number, unit: string) => Promise<void>;
  updateIngredient: (id: number, name: string, minQuantity: number, unit: string) => Promise<void>;
  addProduct: (nome: string, preco: number, descricao: string, recipeItems: Omit<RecipeItem, 'produto_id'>[], imagem_url?: string) => Promise<void>;
  updateProduct: (id: number, nome: string, preco: number, descricao: string, recipeItems: Omit<RecipeItem, 'produto_id'>[], imagem_url?: string) => Promise<void>;
  deleteIngredient: (id: number) => Promise<void>;
  deleteProduct: (id: number) => Promise<void>;
  fetchMovements: () => Promise<void>;
}

const StockContext = createContext<StockContextType | undefined>(undefined);

export const StockProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);

  const fetchIngredients = async () => {
    const { data, error } = await supabase.from('ingredientes').select('*').order('id');
    if (error) {
        console.error('Error fetching ingredients:', error);
        toast.error('Falha ao carregar ingredientes.');
    }
    else setIngredients(data as Ingredient[]);
  };

  const fetchProducts = async () => {
    const { data, error } = await supabase.from('produtos').select('*').order('id');
    if (error) {
        console.error('Error fetching products:', error);
        toast.error('Falha ao carregar produtos.');
    }
    else setProducts(data as Product[]);
  };

  const fetchOrders = async () => {
    const { data, error } = await supabase.from('pedidos').select('*, itens_pedido(*)').order('criado_em', { ascending: false });
    if (error) {
        console.error('Error fetching orders:', error);
        toast.error('Falha ao carregar pedidos.');
    }
    else setOrders(data as any[]); // Use `any` to avoid deep type issues with Supabase response
  };

  const fetchMovements = async () => {
    const { data, error } = await supabase
      .from('movimentacoes_estoque')
      .select('*, ingredientes(nome)')
      .order('criado_em', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching movements:', error);
    } else {
      const formatted = data.map((m: any) => ({
        ...m,
        ingrediente_nome: m.ingredientes?.nome
      }));
      setMovements(formatted);
    }
  };

  useEffect(() => {
    fetchIngredients();
    fetchProducts();
    fetchOrders();
    fetchMovements();
  }, []);

  const addIngredient = async (nome: string, quantidade_atual: number, quantidade_minima: number, unidade_medida: string) => {
    const { error } = await supabase.from('ingredientes').insert([{ nome, quantidade_atual, quantidade_minima, unidade_medida }]);
    if (error) {
        console.error('Error adding ingredient:', error);
        toast.error('Falha ao adicionar ingrediente.');
    }
    else {
        toast.success('Ingrediente adicionado!');
        fetchIngredients();
    }
  };

  const updateIngredient = async (id: number, nome: string, quantidade_minima: number, unidade_medida: string) => {
    try {
      const { error } = await supabase
        .from('ingredientes')
        .update({ nome, quantidade_minima, unidade_medida })
        .eq('id', id);

      if (error) throw error;

      toast.success('Ingrediente atualizado com sucesso!');
      fetchIngredients();
    } catch (error: any) {
      console.error('Error updating ingredient:', error);
      toast.error('Falha ao atualizar ingrediente: ' + error.message);
    }
  };

  const restockIngredient = async (ingredientId: number, amount: number) => {
    const { data: currentIngredient, error: fetchError } = await supabase
      .from('ingredientes')
      .select('quantidade_atual')
      .eq('id', ingredientId)
      .single();

    if (fetchError) {
      console.error('Error fetching ingredient for restock:', fetchError);
      toast.error('Falha ao buscar ingrediente para repor.');
      return;
    }

    const newQuantity = currentIngredient.quantidade_atual + amount;

    const { error } = await supabase
      .from('ingredientes')
      .update({ quantidade_atual: newQuantity })
      .eq('id', ingredientId);

    if (error) {
        console.error('Error restock ingredient:', error);
        toast.error('Falha ao repor estoque.');
    }
    else {
        // Log movement
        await supabase.from('movimentacoes_estoque').insert([{
          ingrediente_id: ingredientId,
          tipo: 'entrada',
          quantidade: amount,
          descricao: 'Reposição de Estoque'
        }]);
        
        fetchIngredients();
        fetchMovements();
    }
  };

  const updateOrderStatus = async (orderId: number, status: 'Pendente' | 'Pronto' | 'Entregue') => {
    const { error } = await supabase.from('pedidos').update({ status }).eq('id', orderId);
    if (error) {
        console.error('Error updating order status:', error);
        toast.error('Falha ao atualizar status do pedido.');
    }
    else {
        fetchOrders();
    }
  };

 const addProduct = async (nome: string, preco: number, descricao: string, recipeItems: Omit<RecipeItem, 'produto_id'>[], imagem_url?: string) => {
    const precoFloat = parseFloat(preco as any);

    const { data: newProduct, error: productError } = await supabase
      .from('produtos')
      .insert([{ 
        nome, 
        preco: precoFloat, 
        descricao, 
        imagem_url: imagem_url || `https://picsum.photos/seed/${nome}/400/300` 
      }])
      .select()
      .single();

    if (productError) {
      console.error('Error adding product:', productError);
      alert('Erro ao salvar produto: ' + productError.message);
      return;
    }

    if (!newProduct) {
        console.error('Error adding product: No data returned');
        alert('Erro ao salvar produto: Nenhum dado retornado.');
        return;
    }

    const itemsToInsert = recipeItems.map(item => ({ 
      produto_id: newProduct.id, 
      ingrediente_id: item.ingrediente_id, 
      quantidade_gasta: item.quantidade_gasta 
    }));

    const { error: recipeError } = await supabase.from('ficha_tecnica').insert(itemsToInsert);

    if (recipeError) {
      console.error('Error adding recipe items:', recipeError);
      alert('Erro ao salvar ficha técnica: ' + recipeError.message);
      return;
    }

    toast.success('Produto e ficha técnica adicionados com sucesso!');
    fetchProducts();
  };

  const updateProduct = async (id: number, nome: string, preco: number, descricao: string, recipeItems: Omit<RecipeItem, 'produto_id'>[], imagem_url?: string) => {
    try {
      const precoFloat = parseFloat(preco as any);

      // 1. Update basic product info
      const updateData: any = { nome, preco: precoFloat, descricao };
      if (imagem_url) updateData.imagem_url = imagem_url;

      const { error: productError } = await supabase
        .from('produtos')
        .update(updateData)
        .eq('id', id);

      if (productError) throw productError;

      // 2. Clear old recipe items
      const { error: deleteError } = await supabase
        .from('ficha_tecnica')
        .delete()
        .eq('produto_id', id);

      if (deleteError) throw deleteError;

      // 3. Insert new recipe items
      const itemsToInsert = recipeItems.map(item => ({ 
        produto_id: id, 
        ingrediente_id: item.ingrediente_id, 
        quantidade_gasta: item.quantidade_gasta 
      }));

      const { error: insertError } = await supabase
        .from('ficha_tecnica')
        .insert(itemsToInsert);

      if (insertError) throw insertError;

      toast.success('Produto e ficha técnica atualizados com sucesso!');
      fetchProducts();
    } catch (error: any) {
      console.error('Error updating product:', error);
      alert('Erro ao atualizar produto: ' + error.message);
    }
  };

  const deleteIngredient = async (id: number) => {
    try {
      const { error } = await supabase.from('ingredientes').delete().eq('id', id);
      if (error) throw error;
      toast.success('Ingrediente excluído com sucesso!');
      fetchIngredients();
    } catch (error: any) {
      console.error('Error deleting ingredient:', error);
      if (error.code === '23503') { // Foreign key violation
        toast.error('Erro: Este ingrediente não pode ser excluído pois está vinculado a uma Ficha Técnica.');
      } else {
        toast.error('Falha ao excluir ingrediente.');
      }
    }
  };

  const deleteProduct = async (id: number) => {
    try {
      const { error } = await supabase.from('produtos').delete().eq('id', id);
      if (error) throw error;
      toast.success('Produto excluído com sucesso!');
      fetchProducts();
    } catch (error: any) {
      console.error('Error deleting product:', error);
      if (error.code === '23503') { // Foreign key violation
        toast.error('Erro: Este produto não pode ser excluído pois está vinculado a um Pedido existente.');
      } else {
        toast.error('Falha ao excluir produto.');
      }
    }
  };

  const addOrder = async (orderData: Omit<Order, 'id' | 'criado_em' | 'items'>, itemsData: Omit<OrderItem, 'id' | 'pedido_id'>[]) => {
    const { data, error } = await supabase.rpc('process_order', {
      p_cliente_nome: orderData.cliente_nome,
      p_total: orderData.total,
      p_items: itemsData.map(item => ({ produto_id: item.produto_id, quantidade: item.quantidade, preco_unitario: item.preco_unitario }))
    });

    if (error) {
      console.error('Error processing order:', error);
      toast.error(`Falha ao processar pedido: ${error.message}`);
    } else {
      console.log('Order processed successfully:', data);
      
      // Log stock movements for each product in the order
      try {
        for (const item of itemsData) {
          // Get recipe for this product
          const { data: recipe } = await supabase
            .from('ficha_tecnica')
            .select('ingrediente_id, quantidade_gasta')
            .eq('produto_id', item.produto_id);
          
          if (recipe) {
            const movementsToInsert = recipe.map(r => ({
              ingrediente_id: r.ingrediente_id,
              tipo: 'saida',
              quantidade: r.quantidade_gasta * item.quantidade,
              descricao: 'Venda de Lanche'
            }));
            
            await supabase.from('movimentacoes_estoque').insert(movementsToInsert);
          }
        }
      } catch (err) {
        console.error('Error logging stock movements:', err);
      }

      fetchOrders();
      fetchIngredients();
      fetchMovements();
    }
  };

  return (
    <StockContext.Provider value={{ ingredients, products, orders, movements, addOrder, updateOrderStatus, restockIngredient, addIngredient, updateIngredient, addProduct, updateProduct, deleteIngredient, deleteProduct, fetchMovements }}>
      {children}
    </StockContext.Provider>
  );
};

export const useStock = () => {
  const context = useContext(StockContext);
  if (context === undefined) {
    throw new Error('useStock must be used within a StockProvider');
  }
  return context;
};
