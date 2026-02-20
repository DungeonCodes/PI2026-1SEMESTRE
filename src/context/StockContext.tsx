/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useState, useContext, ReactNode } from 'react';
import { Ingredient, MenuItem, Order } from '../types';

interface StockContextType {
  ingredients: Ingredient[];
  menuItems: MenuItem[];
  orders: Order[];
  addOrder: (order: Omit<Order, 'id' | 'status' | 'createdAt'>) => void;
  updateOrderStatus: (orderId: number, status: 'Pendente' | 'Pronto' | 'Entregue') => void;
  restockIngredient: (ingredientId: number, amount: number) => void;
  addIngredient: (name: string, quantity: number, minQuantity: number) => void;
}

const StockContext = createContext<StockContextType | undefined>(undefined);

export const StockProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { id: 1, name: 'Pão', quantity: 100, minQuantity: 20 },
    { id: 2, name: 'Blend 180g', quantity: 50, minQuantity: 10 },
    { id: 3, name: 'Queijo Prato', quantity: 200, minQuantity: 40 },
    { id: 4, name: 'Bacon', quantity: 150, minQuantity: 30 },
    { id: 5, name: 'Alface', quantity: 1, minQuantity: 1 },
    { id: 6, name: 'Tomate', quantity: 1, minQuantity: 1 },
  ]);

  const [menuItems] = useState<MenuItem[]>([
    {
      id: 1,
      name: 'X-Salada',
      description: 'O clássico com um toque da casa.',
      price: 25.0,
      image: 'https://picsum.photos/seed/x-salada/400/300',
      ingredients: [
        { ingredientId: 1, quantity: 1 },
        { ingredientId: 2, quantity: 1 },
        { ingredientId: 3, quantity: 2 },
        { ingredientId: 5, quantity: 1 },
        { ingredientId: 6, quantity: 1 },
      ],
    },
    {
      id: 2,
      name: 'X-Bacon',
      description: 'Para os amantes de bacon.',
      price: 28.0,
      image: 'https://picsum.photos/seed/x-bacon/400/300',
      ingredients: [
        { ingredientId: 1, quantity: 1 },
        { ingredientId: 2, quantity: 1 },
        { ingredientId: 3, quantity: 2 },
        { ingredientId: 4, quantity: 3 },
      ],
    },
  ]);

  const [orders, setOrders] = useState<Order[]>([]);

  const addOrder = (order: Omit<Order, 'id' | 'status' | 'createdAt'>) => {
    // Verificar se há ingredientes suficientes
    for (const item of order.items) {
      const menuItem = menuItems.find((mi) => mi.id === item.menuItemId);
      if (menuItem) {
        for (const ing of menuItem.ingredients) {
          const ingredient = ingredients.find((i) => i.id === ing.ingredientId);
          if (!ingredient || ingredient.quantity < ing.quantity * item.quantity) {
            alert(`Estoque insuficiente para ${menuItem.name}`);
            return;
          }
        }
      }
    }

    setOrders((prevOrders) => [
      ...prevOrders,
      { ...order, id: prevOrders.length + 1, status: 'Pendente', createdAt: new Date() },
    ]);

    // Lógica de baixa de estoque
    order.items.forEach((item) => {
      const menuItem = menuItems.find((mi) => mi.id === item.menuItemId);
      if (menuItem) {
        menuItem.ingredients.forEach((ing) => {
          setIngredients((prevIngredients) =>
            prevIngredients.map((i) =>
              i.id === ing.ingredientId
                ? { ...i, quantity: i.quantity - ing.quantity * item.quantity }
                : i
            )
          );
        });
      }
    });
  };

  const updateOrderStatus = (orderId: number, status: 'Pendente' | 'Pronto' | 'Entregue') => {
    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.id === orderId ? { ...order, status } : order
      )
    );
  };

  const restockIngredient = (ingredientId: number, amount: number) => {
    setIngredients((prevIngredients) =>
      prevIngredients.map((i) =>
        i.id === ingredientId ? { ...i, quantity: i.quantity + amount } : i
      )
    );
  };

  const addIngredient = (name: string, quantity: number, minQuantity: number) => {
    setIngredients((prevIngredients) => [
      ...prevIngredients,
      {
        id: prevIngredients.length > 0 ? Math.max(...prevIngredients.map(i => i.id)) + 1 : 1,
        name,
        quantity,
        minQuantity,
      },
    ]);
  };

  return (
    <StockContext.Provider value={{ ingredients, menuItems, orders, addOrder, updateOrderStatus, restockIngredient, addIngredient }}>
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
