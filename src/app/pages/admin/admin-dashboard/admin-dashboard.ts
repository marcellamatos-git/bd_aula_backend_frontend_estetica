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

  carregarProdutos() {
    this.http.get<any[]>(this.apiUrlItens).subscribe({
      next: (res) => {
        const lista = res || [];
        // Mantém todos os produtos para a seleção
        this.produtos = lista.map(i => ({
          iditem: i.iditem || i.id || i.idItem,
          item: i.item || i.nome || i.nomeItem,
          unidade: i.unidade || 'UN'
        }));
      },
      error: (err) => console.error('Erro ao carregar produtos:', err)
    });
  }

  registrarEntrada() {
    this.mensagemSucesso = '';
    this.mensagemErro = '';

    const idItemNum = Number(this.entrada.iditem);

    if (!idItemNum || isNaN(idItemNum)) {
      this.mensagemErro = 'Por favor, selecione um produto válido da lista.';
      return;
    }

    if (this.entrada.quantidadeEntrada <= 0) {
      this.mensagemErro = 'A quantidade de entrada deve ser maior que zero.';
      return;
    }

    this.salvandoEntrada = true;

    const produtoSel = this.produtos.find(p => p.iditem === idItemNum);
    const unidadeProd = produtoSel?.unidade || 'UN';

    // Monta o DTO exato da tabela entrada_produto
    const payloadEntrada = {
      iditem: idItemNum,
      quantidadeEntrada: Number(this.entrada.quantidadeEntrada),
      unidade: unidadeProd,
      valorUnitarioEntrada: Number(this.entrada.valorUnitarioEntrada),
      dataEntradaProduto: this.entrada.dataEntradaProduto ? this.entrada.dataEntradaProduto : new Date().toISOString().split('T')[0]
    };

    console.log('Enviando entrada válida:', payloadEntrada);

    this.http.post(this.apiUrlEntradas, payloadEntrada).subscribe({
      next: (res) => {
        console.log('Entrada registrada com sucesso:', res);
        this.mensagemSucesso = 'Entrada de produto registrada com sucesso!';
        this.limparFormulario();
        this.carregarEstoque();
        this.salvandoEntrada = false;
      },
      error: (err) => {
        console.error('Erro 500 do servidor ao registrar entrada:', err);
        this.mensagemErro = 'Erro 500 no banco MySQL. Certifique-se de cadastrar o produto em "Cadastrar Produtos" antes de dar entrada.';
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