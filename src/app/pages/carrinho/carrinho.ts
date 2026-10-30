import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService, CartItem } from '../../services/cart.service';
import { PedidosService } from '../../services/pedidos.service';

@Component({
  selector: 'app-carrinho',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './carrinho.html',
  styleUrl: './carrinho.css'
})
export class CarrinhoComponent implements OnInit {
  itens: CartItem[] = [];

  constructor(
    public cartService: CartService,
    private pedidosService: PedidosService
  ) {}

  ngOnInit(): void {
    this.itens = this.cartService.getItems();
  }

  remover(iditem: number) {
    this.cartService.removeItem(iditem);
    this.itens = this.cartService.getItems();
  }

  alterarQtd(iditem: number, event: any) {
    const qtd = Number(event.target.value);
    this.cartService.updateQuantity(iditem, qtd);
  }

  finalizarPedido() {
    if (this.itens.length === 0) return;

    const payload = {
      idCliente: 1,
      itens: this.itens.map(i => ({
        iditem: i.iditem,
        quantidade: i.quantidade,
        precoUnitario: i.preco
      }))
    };

    this.pedidosService.criarPedido(payload).subscribe({
      next: () => {
        alert('Pedido realizado com sucesso!');
        this.cartService.clearCart();
        this.itens = [];
      },
      error: (err: any) => alert('Erro ao finalizar pedido.')
    });
  }
}