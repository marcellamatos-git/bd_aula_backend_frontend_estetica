import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
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
  categorias: any[] = [];

  termoBusca: string = '';
  categoriaSelecionada: string = '';
  tipoSelecionado: string = '';
  carregando: boolean = false;
  mensagemNotificacao: string = '';

  private apiUrlItens = 'https://localhost:7000/api/Itens';
  private apiUrlCategorias = 'https://localhost:7000/api/Categorias';

  constructor(
    private http: HttpClient,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    this.carregarCategorias();
    this.carregarItens();
  }

  carregarCategorias() {
    this.http.get<any[]>(this.apiUrlCategorias).subscribe({
      next: (res) => this.categorias = res || [],
      error: (err) => {
        console.error('Erro ao buscar categorias:', err);
        this.categorias = [];
      }
    });
  }

  carregarItens() {
    this.carregando = true;
    this.http.get<any[]>(this.apiUrlItens).subscribe({
      next: (res) => {
        console.log('Itens recebidos do backend:', res);
        const listaBruta = res || [];

        // Mapeamento flexível para aceitar qualquer estrutura do C#
        this.itens = listaBruta.map(i => {
          const tipoCalculado = i.tipoItem || i.tipo || i.tipo_item || (i.unidade ? 'P' : 'S');
          return {
            iditem: i.iditem || i.id || i.idItem,
            item: i.item || i.nome || i.nomeItem || 'Item sem nome',
            descricaoItem: i.descricaoItem || i.descricao || '',
            idcategoria: i.idcategoria || i.idCategoria,
            preco: i.preco || i.precoVenda || i.preco_venda || 0,
            tipoItem: String(tipoCalculado).toUpperCase(),
            quantidadeEstoque: i.quantidadeEstoque || i.quantidade || 99
          };
        });

        this.aplicarFiltros();
        this.carregando = false;
      },
      error: (err) => {
        console.error('Erro ao carregar itens:', err);
        this.itens = [];
        this.itensFiltrados = [];
        this.carregando = false;
      }
    });
  }

  aplicarFiltros() {
    if (!this.itens || this.itens.length === 0) {
      this.itensFiltrados = [];
      return;
    }

    this.itensFiltrados = this.itens.filter(item => {
      const nomeItem = String(item.item || '').toLowerCase();
      const descItem = String(item.descricaoItem || '').toLowerCase();
      const busca = this.termoBusca.toLowerCase().trim();

      // Filtro por Nome/Descrição
      const atendeNome = !busca || nomeItem.includes(busca) || descItem.includes(busca);

      // Filtro por Categoria
      const atendeCategoria = !this.categoriaSelecionada || 
        String(item.idcategoria) === String(this.categoriaSelecionada);

      // Filtro por Tipo (P = Produto, S = Serviço)
      const atendeTipo = !this.tipoSelecionado || 
        String(item.tipoItem).toUpperCase() === String(this.tipoSelecionado).toUpperCase();

      return atendeNome && atendeCategoria && atendeTipo;
    });
  }

  adicionarAoCarrinho(item: any) {
    this.cartService.adicionarAoCarrinho(item);
    this.mensagemNotificacao = `"${item.item}" adicionado ao carrinho!`;
    setTimeout(() => this.mensagemNotificacao = '', 3000);
  }
}