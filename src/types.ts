/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Ingredient {
  id: number;
  nome: string;
  quantidade_atual: number;
  quantidade_minima: number;
  unidade_medida: string;
}

export interface Product {
  id: number;
  nome: string;
  descricao: string;
  preco: number;
  imagem_url: string;
}

export interface RecipeItem {
  produto_id: number;
  ingrediente_id: number;
  quantidade_gasta: number;
}

export interface Order {
  id: number;
  cliente_nome: string;
  status: 'Pendente' | 'Pronto' | 'Entregue';
  total: number;
  criado_em: string;
  items: OrderItem[]; // In Supabase response, this will be `itens_pedido`
}

export interface OrderItem {
  id: number;
  pedido_id: number;
  produto_id: number;
  quantidade: number;
  preco_unitario: number;
  name?: string; // For UI convenience
}
