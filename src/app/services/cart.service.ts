
import { Injectable } from '@angular/core';

export interface ItemCarrinho {
  iditem: number;
  item: string;
  descricaoItem?: string;
  preco: number;
  tipoItem: 'P' | 'S';
  quantidade: number;
  quantidadeEstoque?: number;
}

export type CartItem = ItemCarrinho;

@Injectable({
  providedIn: 'root'
})
export class CartService {

  private itens: ItemCarrinho[] = [];

  getItens(): ItemCarrinho[] {
    return this.itens;
  }

  getItems(): ItemCarrinho[] {
    return this.getItens();
  }

  adicionarAoCarrinho(produtoServico: any): void {

    const itemExistente = this.itens.find(
      i => i.iditem === produtoServico.iditem
    );

    if (itemExistente) {

      if (
        produtoServico.tipoItem === 'P' &&
        produtoServico.quantidadeEstoque !== undefined
      ) {

        if (itemExistente.quantidade < produtoServico.quantidadeEstoque) {
          itemExistente.quantidade++;
        } else {
          alert('Quantidade máxima em estoque atingida!');
        }

      } else {
        itemExistente.quantidade++;
      }

    } else {

      this.itens.push({
        iditem: Number(produtoServico.iditem),
        item: produtoServico.item || produtoServico.nome,
        descricaoItem: produtoServico.descricaoItem || produtoServico.descricao,
        preco: Number(produtoServico.preco || produtoServico.precoVenda || 0),
        tipoItem: produtoServico.tipoItem || 'P',
        quantidade: 1,
        quantidadeEstoque: produtoServico.quantidadeEstoque
      });

    }
  }

  removerItem(iditem: number): void {
    this.itens = this.itens.filter(i => i.iditem !== iditem);
  }

  removeItem(iditem: number): void {
    this.removerItem(iditem);
  }

  atualizarQuantidade(iditem: number, quantidade: number): void {

    const item = this.itens.find(i => i.iditem === iditem);

    if (item) {

      if (quantidade <= 0) {
        this.removerItem(iditem);
      } else {
        item.quantidade = quantidade;
      }

    }
  }

  limparCarrinho(): void {
    this.itens = [];
  }

  getTotal(): number {
    return this.itens.reduce(
      (sum, item) => sum + (item.preco * item.quantidade),
      0
    );
  }
}
