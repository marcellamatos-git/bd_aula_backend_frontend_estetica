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
      next: (res) => {
        const lista = res || [];
        this.categorias = lista.map(c => ({
          idcategoria: c.Idcategoria ?? c.idcategoria ?? c.IdCategoria ?? c.Id ?? c.id,
          nomeCategoria: c.Categoria1 ?? c.categoria1 ?? c.NomeCategoria ?? c.nomeCategoria ?? c.categoria ?? c.nome
        }));
      },
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

        this.itens = listaBruta.map(i => {
          const id = i.Iditem ?? i.iditem ?? i.idItem ?? i.Id ?? i.id;
          const nome = i.Item ?? i.item ?? i.Nome ?? i.nome ?? i.NomeItem ?? i.nomeItem ?? `Item #${id}`;
          const descricao = i.DescricaoItem ?? i.descricaoItem ?? i.Descricao ?? i.descricao ?? '';
          const idCat = i.Idcategoria ?? i.idcategoria ?? i.IdCategoria ?? i.idCategoria;
          
          const valorPreco = i.Preco ?? i.preco ?? i.PrecoVenda ?? i.precoVenda ?? i.preco_venda ?? i.ValorItem ?? i.valorItem ?? 0;
          
          const tipoBruto = i.TipoItem ?? i.tipoItem ?? i.Tipo ?? i.tipo ?? i.tipo_item ?? (i.Unidade || i.unidade ? 'P' : 'S');

          return {
            iditem: id,
            item: nome,
            descricaoItem: descricao,
            idcategoria: idCat,
            preco: Number(valorPreco),
            tipoItem: String(tipoBruto).toUpperCase(),
            quantidadeEstoque: i.QuantidadeEstoque ?? i.quantidadeEstoque ?? i.quantidade ?? 99
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

      // 1. Filtro por Nome/Descrição
      const atendeNome = !busca || nomeItem.includes(busca) || descItem.includes(busca);

      // 2. Filtro por Categoria
      const atendeCategoria = !this.categoriaSelecionada || 
        String(item.idcategoria) === String(this.categoriaSelecionada);

      // 3. Filtro por Tipo (P = Produto, S = Serviço)
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