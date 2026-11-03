import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-produtos-crud',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './produtos-crud.html',
  styleUrl: './produtos-crud.css'
})
export class ProdutosCrudComponent implements OnInit {
  produtos: any[] = [];
  categorias: any[] = [];
  idProdutoEdicao: number | null = null;

  produto: any = {
    item: '',
    descricaoItem: '',
    idcategoria: null,
    preco: 0,
    tipoItem: 'P', // 'P' para Produto
    unidade: 'UN',
    codigoPreco: 0,
    ativoProdutoServico: 'S'
  };

  carregando: boolean = false;
  salvando: boolean = false;
  mensagemSucesso: string = '';
  mensagemErro: string = '';

  private apiUrlItens = 'https://localhost:7000/api/Itens';
  private apiUrlCategorias = 'https://localhost:7000/api/Categorias';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.carregarCategorias();
    this.carregarProdutos();
  }

  carregarCategorias() {
    this.http.get<any[]>(this.apiUrlCategorias).subscribe({
      next: (res) => this.categorias = res || [],
      error: (err) => console.error('Erro ao buscar categorias:', err)
    });
  }

  carregarProdutos() {
    this.carregando = true;
    this.http.get<any[]>(this.apiUrlItens).subscribe({
      next: (res) => {
        // Filtra para exibir apenas os produtos (tipo 'P')
        this.produtos = (res || []).filter(i => i.tipoItem === 'P' || i.tipo === 'P');
        this.carregando = false;
      },
      error: (err) => {
        console.error('Erro ao carregar produtos:', err);
        this.carregando = false;
      }
    });
  }

  salvarProduto() {
    this.mensagemSucesso = '';
    this.mensagemErro = '';

    if (!this.produto.item || !this.produto.idcategoria) {
      this.mensagemErro = 'Preencha o nome do produto e a categoria.';
      return;
    }

    this.salvando = true;

    if (this.idProdutoEdicao !== null) {
      // Atualizar
      this.http.put(`${this.apiUrlItens}/${this.idProdutoEdicao}`, this.produto).subscribe({
        next: () => {
          this.mensagemSucesso = 'Produto atualizado com sucesso!';
          this.limparFormulario();
          this.carregarProdutos();
        },
        error: (err) => {
          console.error('Erro ao atualizar produto:', err);
          this.mensagemErro = 'Erro ao atualizar produto.';
          this.salvando = false;
        }
      });
    } else {
      // Cadastrar
      this.http.post(this.apiUrlItens, this.produto).subscribe({
        next: () => {
          this.mensagemSucesso = 'Produto de beleza cadastrado com sucesso!';
          this.limparFormulario();
          this.carregarProdutos();
        },
        error: (err) => {
          console.error('Erro ao cadastrar produto:', err);
          this.mensagemErro = 'Erro ao cadastrar produto.';
          this.salvando = false;
        }
      });
    }
  }

  editarProduto(p: any) {
    this.idProdutoEdicao = p.iditem;
    this.produto = { ...p };
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  desativarProduto(p: any) {
    if (confirm(`Deseja desativar o produto "${p.item}"?`)) {
      const produtoAtualizado = { ...p, ativoProdutoServico: 'N' };
      this.http.put(`${this.apiUrlItens}/${p.iditem}`, produtoAtualizado).subscribe({
        next: () => {
          this.carregarProdutos();
        },
        error: (err) => console.error('Erro ao desativar produto:', err)
      });
    }
  }

  limparFormulario() {
    this.idProdutoEdicao = null;
    this.salvando = false;
    this.produto = {
      item: '',
      descricaoItem: '',
      idcategoria: null,
      preco: 0,
      tipoItem: 'P',
      unidade: 'UN',
      codigoPreco: 0,
      ativoProdutoServico: 'S'
    };
  }
}