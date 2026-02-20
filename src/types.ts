/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Ingredient {
  id: number;
  name: string;
  quantity: number;
  minQuantity: number;
}

export interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  ingredients: { ingredientId: number; quantity: number }[];
}

export interface OrderItem {
  menuItemId: number;
  name: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: number;
  items: OrderItem[];
  status: 'Pendente' | 'Pronto' | 'Entregue';
  createdAt: Date;
}
