import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProdutosService } from '../../services/produtos.service';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-catalogo',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './catalogo.html',
  styleUrl: './catalogo.css'
})
export class CatalogoComponent implements OnInit {
  itens: any[] = [];
  itensFiltrados: any[] = [];
  termoBusca: string = '';

  constructor(
    private produtosService: ProdutosService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    this.carregarItens();
  }

  carregarItens() {
    this.produtosService.getItens().subscribe({
      next: (data: any[]) => {
        this.itens = data;
        this.itensFiltrados = data;
      },
      error: (err: any) => console.error('Erro ao carregar catálogo:', err)
    });
  }

  filtrar() {
    this.itensFiltrados = this.itens.filter(item => 
      item.item1.toLowerCase().includes(this.termoBusca.toLowerCase())
    );
  }

  adicionarAoCarrinho(item: any) {
    this.cartService.addToCart({
      iditem: item.iditem,
      nome: item.item1,
      preco: item.preco,
      quantidade: 1,
      tipo: item.tipoItem
    });
    alert(`${item.item1} adicionado ao carrinho!`);
  }
}