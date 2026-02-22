import React, { useState } from 'react';
import { useStock } from '../context/StockContext';
import { useConfig } from '../context/ConfigContext';
import { useAuth } from '../context/AuthContext';
import { Product, OrderItem } from '../types';
import toast from 'react-hot-toast';

const PDV: React.FC = () => {
  const { products, addOrder } = useStock();
  const { settings } = useConfig();
  const { user } = useAuth();
  const [cart, setCart] = useState<(Omit<OrderItem, 'id' | 'pedido_id'> & { name: string })[]>([]);

  const addToCart = (product: Product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.produto_id === product.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.produto_id === product.id
            ? { ...item, quantidade: item.quantidade + 1 }
            : item
        );
      } else {
        return [
          ...prevCart,
          { produto_id: product.id, name: product.nome, quantidade: 1, preco_unitario: product.preco },
        ];
      }
    });
  };

  const placeOrder = async () => {
    if (cart.length > 0) {
      const total = cart.reduce((acc, item) => acc + item.preco_unitario * item.quantidade, 0);
      const itemsToOrder = cart.map(({ name, ...item }) => item);
      await addOrder({ cliente_nome: 'Cliente Balcão', total, status: 'Pendente' }, itemsToOrder);
      setCart([]);
      toast.success('Pedido realizado com sucesso!');
    } else {
      toast.error('Seu carrinho está vazio.');
    }
  };

  return (
    <div className="p-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <h2 
          className="text-2xl font-bold mb-6 transition-colors duration-300"
          style={{ color: settings?.cor_destaque || '#f97316' }}
        >
          Cardápio
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {products.map((item) => (
            <div key={item.id} className="bg-gray-800/80 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-white/5 flex flex-col h-full">
              <img src={item.imagem_url} alt={item.nome} className="w-full h-40 object-cover rounded-lg mb-4" referrerPolicy="no-referrer" />
              <div className="flex-grow">
                <h3 className="text-xl font-bold mb-1">{item.nome}</h3>
                <p className="text-gray-400 text-sm line-clamp-2">{item.descricao}</p>
                <p className="text-xl font-bold mt-3" style={{ color: settings?.cor_destaque || '#f97316' }}>
                  R$ {item.preco.toFixed(2)}
                </p>
              </div>
              <button
                onClick={() => addToCart(item)}
                className="mt-4 text-white font-bold py-2 px-4 rounded-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                style={{ backgroundColor: settings?.cor_destaque || '#f97316' }}
              >
                Adicionar ao Carrinho
              </button>
            </div>
          ))}
        </div>
      </div>
      <div className="lg:col-span-1 bg-gray-800/60 backdrop-blur-md p-6 rounded-xl shadow-xl border border-white/5 h-fit sticky top-24">
        <h2 
          className="text-2xl font-bold mb-6 transition-colors duration-300"
          style={{ color: settings?.cor_destaque || '#f97316' }}
        >
          Carrinho
        </h2>
        {cart.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-400">Seu carrinho está vazio.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <ul className="divide-y divide-white/5">
              {cart.map((item) => (
                <li key={item.produto_id} className="flex justify-between items-center py-3">
                  <div className="flex flex-col">
                    <span className="font-medium">{item.name}</span>
                    <span className="text-xs text-gray-500">{item.quantidade}x R$ {item.preco_unitario.toFixed(2)}</span>
                  </div>
                  <span className="font-bold">R$ {(item.preco_unitario * item.quantidade).toFixed(2)}</span>
                </li>
              ))}
            </ul>
            <div className="border-t border-white/10 pt-4">
              <div className="flex justify-between items-center font-bold text-xl">
                <span>Total</span>
                <span style={{ color: settings?.cor_destaque || '#f97316' }}>
                  R$ {
                    cart.reduce((total, item) => total + item.preco_unitario * item.quantidade, 0).toFixed(2)
                  }
                </span>
              </div>
            </div>
            <button
              onClick={placeOrder}
              disabled={cart.length === 0}
              className="mt-6 w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg disabled:bg-gray-700 disabled:text-gray-500 transition-all duration-200"
            >
              Finalizar Pedido
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PDV;
