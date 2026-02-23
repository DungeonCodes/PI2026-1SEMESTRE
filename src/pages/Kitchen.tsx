import React from 'react';
import { useStock } from '../context/StockContext';
import { useConfig } from '../context/ConfigContext';
import { Product } from '../types';

import { useAuth } from '../context/AuthContext';

const Kitchen: React.FC = () => {
  const { orders, updateOrderStatus } = useStock();
  const { settings } = useConfig();
  const { user } = useAuth();

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <h2 
        className="text-2xl font-bold mb-6 transition-colors duration-300"
        style={{ color: settings?.cor_destaque || '#f97316' }}
      >
        Pedidos na Cozinha
      </h2>
      <div className="space-y-8">
        <div>
          <h3 className="text-xl font-bold mb-4 flex items-center">
            <span className="w-3 h-3 rounded-full bg-yellow-500 mr-2 animate-pulse"></span>
            Pendentes
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {orders
              .filter((order) => order.status === 'Pendente')
              .map((order) => (
                <div key={order.id} className="bg-gray-800/80 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-white/5">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold">Pedido #{order.id}</h3>
                    <span className="text-xs text-gray-400">{new Date(order.criado_em).toLocaleTimeString()}</span>
                  </div>
                  <ul className="space-y-2 mb-6">
                    {order.itens_pedido?.map((item) => (
                      <li key={item.id} className="flex justify-between border-b border-white/5 pb-1">
                        <span className="font-medium">{item.produtos?.nome || 'Produto'}</span>
                        <span className="font-bold text-orange-400">x{item.quantidade}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => updateOrderStatus(order.id, 'Pronto')}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                  >
                    Marcar como Pronto
                  </button>
                </div>
              ))}
            {orders.filter(o => o.status === 'Pendente').length === 0 && (
              <p className="text-gray-500 italic">Nenhum pedido pendente.</p>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-xl font-bold mb-4 flex items-center">
            <span className="w-3 h-3 rounded-full bg-green-500 mr-2"></span>
            Prontos para Entrega
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {orders
              .filter((order) => order.status === 'Pronto')
              .map((order) => (
                <div key={order.id} className="bg-green-900/40 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-green-500/20">
                  <h3 className="text-xl font-bold mb-4">Pedido #{order.id}</h3>
                  <ul className="space-y-2 mb-6">
                    {order.itens_pedido?.map((item) => (
                      <li key={item.id} className="flex justify-between border-b border-white/5 pb-1">
                        <span>{item.produtos?.nome || 'Produto'}</span>
                        <span className="font-bold">x{item.quantidade}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => updateOrderStatus(order.id, 'Entregue')}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                  >
                    Marcar como Entregue
                  </button>
                </div>
              ))}
            {orders.filter(o => o.status === 'Pronto').length === 0 && (
              <p className="text-gray-500 italic">Nenhum pedido pronto.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Kitchen;
