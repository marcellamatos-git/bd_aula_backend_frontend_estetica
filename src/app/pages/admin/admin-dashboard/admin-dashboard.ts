import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css'
})
export class AdminDashboardComponent implements OnInit {
  estoque: any[] = [];
  produtos: any[] = [];
  
  // Modelo para o formulário de Entrada de Produtos
  entrada = {
    iditem: null as number | null,
    quantidadeEntrada: 1,
    valorUnitarioEntrada: 0,
    dataEntradaProduto: new Date().toISOString().split('T')[0]
  };

  carregandoEstoque: boolean = false;
  salvandoEntrada: boolean = false;
  mensagemSucesso: string = '';
  mensagemErro: string = '';

  private apiUrlEstoque = 'https://localhost:7000/api/Estoque';
  private apiUrlEntradas = 'https://localhost:7000/api/EntradaProdutos';
  private apiUrlItens = 'https://localhost:7000/api/Itens';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.carregarEstoque();
    this.carregarProdutos();
  }

  // Carrega a listagem geral de estoque
  carregarEstoque() {
    this.carregandoEstoque = true;
    this.http.get<any[]>(this.apiUrlEstoque).subscribe({
      next: (res) => {
        this.estoque = res || [];
        this.carregandoEstoque = false;
      },
      error: (err) => {
        console.error('Erro ao carregar estoque:', err);
        this.carregandoEstoque = false;
      }
    });
  }

  // Carrega os itens do tipo Produto ('P') para o dropdown do formulário
  carregarProdutos() {
    this.http.get<any[]>(this.apiUrlItens).subscribe({
      next: (res) => {
        this.produtos = (res || []).filter(i => i.tipoItem === 'P' || i.tipo === 'P');
      },
      error: (err) => console.error('Erro ao carregar produtos:', err)
    });
  }

  // Registra a entrada do produto
  registrarEntrada() {
    this.mensagemSucesso = '';
    this.mensagemErro = '';

    if (!this.entrada.iditem) {
      this.mensagemErro = 'Selecione um produto.';
      return;
    }

    if (this.entrada.quantidadeEntrada <= 0) {
      this.mensagemErro = 'A quantidade de entrada deve ser maior que zero.';
      return;
    }

    this.salvandoEntrada = true;

    this.http.post(this.apiUrlEntradas, this.entrada).subscribe({
      next: () => {
        this.mensagemSucesso = 'Entrada de produto registrada com sucesso!';
        this.limparFormulario();
        this.carregarEstoque();
        this.salvandoEntrada = false;
      },
      error: (err) => {
        console.error('Erro ao registrar entrada:', err);
        this.mensagemErro = 'Erro ao registrar entrada de produto.';
        this.salvandoEntrada = false;
      }
    });
  }

  limparFormulario() {
    this.entrada = {
      iditem: null,
      quantidadeEntrada: 1,
      valorUnitarioEntrada: 0,
      dataEntradaProduto: new Date().toISOString().split('T')[0]
    };
  }
}