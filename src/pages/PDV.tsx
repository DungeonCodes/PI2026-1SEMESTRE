import React, { useState } from 'react';
import { useStock } from '../context/StockContext';
import { Product, OrderItem } from '../types';
import toast from 'react-hot-toast';

const PDV: React.FC = () => {
  const { products, addOrder } = useStock();
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
    <div className="p-4 grid grid-cols-3 gap-4">
      <div className="col-span-2">
        <h2 className="text-2xl font-bold mb-4 text-orange-500">Cardápio</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((item) => (
            <div key={item.id} className="bg-gray-800 p-4 rounded-lg shadow-md">
              <img src={item.imagem_url} alt={item.nome} className="w-full h-32 object-cover rounded-md mb-4" referrerPolicy="no-referrer" />
              <h3 className="text-xl font-bold">{item.nome}</h3>
              <p className="text-gray-400">{item.descricao}</p>
              <p className="text-lg font-bold mt-2">R$ {item.preco.toFixed(2)}</p>
              <button
                onClick={() => addToCart(item)}
                className="mt-4 bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded">
                Adicionar ao Carrinho
              </button>
            </div>
          ))}
        </div>
      </div>
      <div className="col-span-1 bg-gray-900 p-4 rounded-lg">
        <h2 className="text-2xl font-bold mb-4 text-orange-500">Carrinho</h2>
        {cart.length === 0 ? (
          <p className="text-gray-400">Seu carrinho está vazio.</p>
        ) : (
          <div>
            <ul>
              {cart.map((item) => (
                <li key={item.produto_id} className="flex justify-between items-center mb-2">
                  <span>
                    {item.quantidade}x {item.name}
                  </span>
                  <span>R$ {(item.preco_unitario * item.quantidade).toFixed(2)}</span>
                </li>
              ))}
            </ul>
            <div className="border-t border-gray-700 mt-4 pt-4">
              <div className="flex justify-between items-center font-bold text-lg">
                <span>Total</span>
                <span>
                  R$ {
                    cart.reduce((total, item) => total + item.preco_unitario * item.quantidade, 0).toFixed(2)
                  }
                </span>
              </div>
            </div>
          </div>
        )}
        <button
          onClick={placeOrder}
          disabled={cart.length === 0}
          className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:bg-gray-600">
          Finalizar Pedido
        </button>
      </div>
    </div>
  );
};

export default PDV;
