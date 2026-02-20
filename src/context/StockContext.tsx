import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Ingredient, Product, Order, OrderItem } from '../types';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

interface StockContextType {
  ingredients: Ingredient[];
  products: Product[];
  orders: Order[];
  addOrder: (order: Omit<Order, 'id' | 'criado_em' | 'items'>, items: Omit<OrderItem, 'id' | 'pedido_id'>[]) => Promise<void>;
  updateOrderStatus: (orderId: number, status: 'Pendente' | 'Pronto' | 'Entregue') => Promise<void>;
  restockIngredient: (ingredientId: number, amount: number) => Promise<void>;
  addIngredient: (name: string, quantity: number, minQuantity: number, unit: string) => Promise<void>;
  addProduct: (name: string, price: number, description: string, recipeItems: Omit<RecipeItem, 'produto_id'>[]) => Promise<void>;
}

const StockContext = createContext<StockContextType | undefined>(undefined);

export const StockProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

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

  useEffect(() => {
    fetchIngredients();
    fetchProducts();
    fetchOrders();
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
        fetchIngredients();
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

 const addProduct = async (nome: string, preco: number, descricao: string, recipeItems: Omit<RecipeItem, 'produto_id'>[]) => {
    // 1. Insert the product
    const { data: newProduct, error: productError } = await supabase
      .from('produtos')
      .insert([{ nome, preco, descricao, imagem_url: `https://picsum.photos/seed/${nome}/400/300` }])
      .select()
      .single();

    if (productError || !newProduct) {
      console.error('Error adding product:', productError);
      toast.error('Falha ao adicionar produto.');
      return;
    }

    // 2. Insert the recipe items
    const itemsToInsert = recipeItems.map(item => ({ ...item, produto_id: newProduct.id }));
    const { error: recipeError } = await supabase.from('ficha_tecnica').insert(itemsToInsert);

    if (recipeError) {
      console.error('Error adding recipe items:', recipeError);
      toast.error('Falha ao adicionar a ficha técnica.');
      // Potentially delete the product here to avoid orphaned products
      return;
    }

    toast.success('Produto e ficha técnica adicionados!');
    fetchProducts();
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
      fetchOrders();
      fetchIngredients();
    }
  };

  return (
    <StockContext.Provider value={{ ingredients, products, orders, addOrder, updateOrderStatus, restockIngredient, addIngredient, addProduct }}>
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
