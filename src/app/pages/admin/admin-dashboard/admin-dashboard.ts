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
        const lista = res || [];
        this.estoque = lista.map((e, index) => ({
          iditem: e.iditem ?? e.idItem ?? e.id ?? (index + 1),
          item: e.item ?? e.nome ?? e.nomeItem ?? e.descricaoItem ?? `Produto #${e.iditem ?? e.idItem ?? (index + 1)}`,
          categoria: e.categoria ?? e.nomeCategoria ?? 'Geral',
          quantidadeEstoque: e.quantidadeEstoque ?? e.quantidade_estoque ?? e.quantidade ?? 0,
          unidade: e.unidade ?? 'UN'
        }));
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
        this.produtos = lista
          .filter(i => {
            const tipo = String(i.tipoItem || i.tipo || i.tipo_item || '').toUpperCase();
            return tipo === 'P' || i.unidade;
          })
          .map(i => {
            const realId = Number(i.iditem ?? i.idItem ?? i.id);
            return {
              iditem: realId,
              item: i.item ?? i.nome ?? i.nomeItem ?? `Produto #${realId}`,
              unidade: i.unidade ?? 'UN'
            };
          });
      },
      error: (err) => console.error('Erro ao carregar produtos:', err)
    });
  }

  registrarEntrada() {
    this.mensagemSucesso = '';
    this.mensagemErro = '';

    const idItemNum = Number(this.entrada.iditem);

    if (!idItemNum || isNaN(idItemNum) || idItemNum < 1) {
      this.mensagemErro = 'Por favor, selecione um produto válido da lista.';
      return;
    }

    if (this.entrada.quantidadeEntrada <= 0 || this.entrada.valorUnitarioEntrada <= 0) {
      this.mensagemErro = 'A quantidade e o valor unitário devem ser maiores que zero.';
      return;
    }

    this.salvandoEntrada = true;

    const produtoSel = this.produtos.find(p => p.iditem === idItemNum);
    const unidadeProd = produtoSel?.unidade || 'UN';

    // Garante que a data vá estritamente como YYYY-MM-DD (DateOnly do C#)
    const dataOnly = this.entrada.dataEntradaProduto 
      ? this.entrada.dataEntradaProduto.split('T')[0]
      : new Date().toISOString().split('T')[0];

    // Payload exato esperado pelo EntradaProdutoCreateDto
    const payloadEntrada = {
      Iditem: idItemNum,
      DataEntradaProduto: dataOnly,
      QuantidadeEntrada: Number(this.entrada.quantidadeEntrada),
      Unidade: unidadeProd,
      ValorUnitarioEntrada: Number(this.entrada.valorUnitarioEntrada)
    };

    this.http.post(this.apiUrlEntradas, payloadEntrada).subscribe({
      next: (res) => {
        this.mensagemSucesso = 'Entrada de produto registrada com sucesso!';
        this.limparFormulario();
        this.carregarEstoque();
        this.salvandoEntrada = false;
      },
      error: (err) => {
        console.error('Erro detalhado da API:', err);
        if (err.error?.mensagem) {
          this.mensagemErro = err.error.mensagem;
        } else if (err.error?.errors) {
          const detalhes = Object.values(err.error.errors).flat().join(' | ');
          this.mensagemErro = `Erro de Validação: ${detalhes}`;
        } else {
          this.mensagemErro = 'Não foi possível registrar a entrada. Verifique o cadastro do produto no banco.';
        }
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