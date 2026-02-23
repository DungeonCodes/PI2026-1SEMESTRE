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
  itens_pedido: OrderItem[];
}

export interface OrderItem {
  id: number;
  pedido_id: number;
  produto_id: number;
  quantidade: number;
  preco_unitario: number;
  produtos?: {
    nome: string;
  };
  name?: string; // For UI convenience
}

export interface AppSettings {
  id: number;
  nome_hamburgueria: string;
  cor_texto: string;
  cor_destaque: string;
  imagem_fundo_url: string;
}

export interface StockMovement {
  id: number;
  ingrediente_id: number;
  tipo: 'entrada' | 'saida';
  quantidade: number;
  descricao: string;
  criado_em: string;
  ingrediente_nome?: string; // For UI
}
