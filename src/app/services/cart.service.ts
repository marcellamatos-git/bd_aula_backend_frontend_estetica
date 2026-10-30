import { Injectable } from '@angular/core';

export interface CartItem {
  iditem: number;
  nome: string;
  preco: number;
  quantidade: number;
  tipo: 'P' | 'S';
  estoqueDisponivel?: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private items: CartItem[] = [];

  getItems(): CartItem[] {
    return this.items;
  }

  addToCart(product: CartItem) {
    const existingIndex = this.items.findIndex(i => i.iditem === product.iditem);
    if (existingIndex > -1) {
      const newQty = this.items[existingIndex].quantidade + 1;
      if (product.tipo === 'P' && product.estoqueDisponivel && newQty > product.estoqueDisponivel) {
        alert('Quantidade indisponível em estoque.');
        return;
      }
      this.items[existingIndex].quantidade = newQty;
    } else {
      this.items.push({ ...product, quantidade: 1 });
    }
  }

  updateQuantity(iditem: number, quantity: number) {
    const item = this.items.find(i => i.iditem === iditem);
    if (item) {
      if (item.tipo === 'P' && item.estoqueDisponivel && quantity > item.estoqueDisponivel) {
        alert('Estoque máximo atingido.');
        return;
      }
      item.quantidade = quantity > 0 ? quantity : 1;
    }
  }

  removeItem(iditem: number) {
    this.items = this.items.filter(i => i.iditem !== iditem);
  }

  getTotal(): number {
    return this.items.reduce((sum, item) => sum + (item.preco * item.quantidade), 0);
  }

  clearCart() {
    this.items = [];
    return this.items;
  }
}