import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css'
})
export class AdminDashboardComponent implements OnInit {
  produtos: any[] = [];
  categorias: any[] = [];
  estoque: any[] = [];
  
  totalClientes: number = 0;
  totalPedidos: number = 0;
  buscaIdItem: number | null = null;

  modoNovoItem: boolean = false;
  salvandoEntrada: boolean = false;
  mensagemSucesso: string = '';
  mensagemErro: string = '';

  entrada: any = {
    iditem: null,
    item: '',
    descricaoItem: '',
    preco: 0,
    tipoItem: 'P',
    idcategoria: 1,
    quantidadeEntrada: 1,
    valorUnitarioEntrada: 0,
    dataEntradaProduto: new Date().toISOString().split('T')[0]
  };

  private apiUrlItens = 'https://localhost:7000/api/Itens';
  private apiUrlCategorias = 'https://localhost:7000/api/Categorias';
  private apiUrlEntradas = 'https://localhost:7000/api/EntradaProdutos';
  private apiUrlClientes = 'https://localhost:7000/api/Clientes';
  private apiUrlAtendimentos = 'https://localhost:7000/api/Atendimentos';
  private apiUrlPessoas = 'https://localhost:7000/api/Pessoas';
  private apiUrlPedidos = 'https://localhost:7000/api/Pedidos';

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.carregarItens();
    this.carregarCategorias();
    this.carregarResumoRF24();
  }

  navegarPara(rota: string): void {
    this.router.navigate([rota]);
  }

  carregarResumoRF24(): void {
    this.http.get<any[]>(this.apiUrlClientes).pipe(
      catchError(() => this.http.get<any[]>(this.apiUrlPessoas)),
      catchError(() => of([]))
    ).subscribe(res => {
      this.totalClientes = res ? res.length : 0;
    });

    this.http.get<any[]>(this.apiUrlAtendimentos).pipe(
      catchError(() => this.http.get<any[]>(this.apiUrlPedidos)),
      catchError(() => of([]))
    ).subscribe(res => {
      this.totalPedidos = res ? res.length : 0;
    });
  }

  carregarItens(): void {
    this.http.get<any[]>(this.apiUrlItens).pipe(
      catchError((err) => {
        console.error('Erro ao carregar itens da API:', err);
        return of([]);
      })
    ).subscribe((res) => {
      const lista = res || [];
      this.produtos = lista.filter(i => String(i.tipoItem ?? i.TipoItem ?? (i.tipo || 'P')).toUpperCase() === 'P');
      
      this.estoque = lista.map(i => ({
        iditem: i.iditem ?? i.Iditem ?? i.id,
        item: i.item ?? i.Item ?? i.nomeItem ?? `Item #${i.iditem}`,
        categoria: i.categoriaNome ?? i.CategoriaNome ?? i.categoria ?? 'Geral',
        preco: i.preco ?? i.Preco ?? 0,
        quantidadeEstoque: i.quantidadeEstoque ?? i.quantidade ?? i.QuantidadeEstoque ?? 0,
        tipoItem: String(i.tipoItem ?? i.TipoItem ?? (i.tipo || 'P')).toUpperCase()
      }));
    });
  }

  carregarCategorias(): void {
    this.http.get<any[]>(this.apiUrlCategorias).pipe(
      catchError(() => of([]))
    ).subscribe((res) => {
      this.categorias = res || [];
      if (this.categorias.length > 0 && !this.entrada.idcategoria) {
        const primeiraCat = this.categorias[0];
        this.entrada.idcategoria = primeiraCat.idcategoria ?? primeiraCat.Idcategoria ?? primeiraCat.id ?? 1;
      }
    });
  }

  buscarPorId(): void {
    if (!this.buscaIdItem) {
      this.carregarItens();
      return;
    }

    this.http.get<any>(`${this.apiUrlItens}/${this.buscaIdItem}`).subscribe({
      next: (item) => {
        if (item) {
          this.estoque = [{
            iditem: item.iditem ?? item.Iditem ?? item.id,
            item: item.item ?? item.Item ?? item.nomeItem,
            categoria: item.categoriaNome ?? item.CategoriaNome ?? 'Geral',
            preco: item.preco ?? item.Preco ?? 0,
            quantidadeEstoque: item.quantidadeEstoque ?? item.quantidade ?? item.QuantidadeEstoque ?? 0,
            tipoItem: String(item.tipoItem ?? item.TipoItem ?? (item.tipo || 'P')).toUpperCase()
          }];
          this.mensagemSucesso = `Item #${this.buscaIdItem} localizado com sucesso.`;
          this.mensagemErro = '';
        }
      },
      error: () => {
        this.mensagemErro = `Item #${this.buscaIdItem} não localizado na API (404 Not Found).`;
        this.estoque = [];
      }
    });
  }

  registrarEntrada(): void {
    this.mensagemSucesso = '';
    this.mensagemErro = '';
    this.salvandoEntrada = true;

    if (this.modoNovoItem) {
      if (!this.entrada.item || this.entrada.preco <= 0) {
        this.mensagemErro = 'Informe o nome e um preço de venda válido.';
        this.salvandoEntrada = false;
        return;
      }

      const payloadNovoItem = {
        Item: this.entrada.item,
        DescricaoItem: this.entrada.descricaoItem || '',
        Preco: Number(this.entrada.preco),
        TipoItem: this.entrada.tipoItem,
        Idcategoria: Number(this.entrada.idcategoria)
      };

      this.http.post<any>(this.apiUrlItens, payloadNovoItem).subscribe({
        next: (resCriado) => {
          const idGerado = resCriado?.iditem ?? resCriado?.Iditem ?? resCriado?.id;

          if (this.entrada.tipoItem === 'P' && idGerado) {
            this.enviarEntradaEstoque(idGerado);
          } else {
            this.mensagemSucesso = `Serviço "${this.entrada.item}" cadastrado com sucesso!`;
            this.finalizarOperacao();
          }
        },
        error: (err) => {
          console.error('Erro ao cadastrar item:', err);
          const detalhe = err.error?.detalhe || err.error?.mensagem || 'Erro ao cadastrar na tabela Itens.';
          this.mensagemErro = `Falha: ${detalhe}`;
          this.salvandoEntrada = false;
        }
      });

    } else {
      if (!this.entrada.iditem) {
        this.mensagemErro = 'Selecione um produto cadastrado.';
        this.salvandoEntrada = false;
        return;
      }

      this.enviarEntradaEstoque(Number(this.entrada.iditem));
    }
  }

  private enviarEntradaEstoque(iditem: number): void {
    const idFormatado = Number(iditem);
  
    if (!idFormatado || isNaN(idFormatado)) {
      this.mensagemErro = 'ID do item inválido para registrar estoque.';
      this.salvandoEntrada = false;
      return;
    }
  
    const payloadEntrada = {
      Iditem: idFormatado,
      DataEntradaProduto: this.entrada.dataEntradaProduto,
      QuantidadeEntrada: Number(this.entrada.quantidadeEntrada),
      Unidade: 'UN',
      ValorUnitarioEntrada: Number(this.entrada.valorUnitarioEntrada || this.entrada.preco)
    };
  
    this.http.post(this.apiUrlEntradas, payloadEntrada).subscribe({
      next: () => {
        this.mensagemSucesso = 'Item e entrada de estoque salvos com sucesso!';
        this.finalizarOperacao();
      },
      error: (err) => {
        console.error('Erro ao salvar estoque:', err);
        const msgApi = err.error?.detalhe || err.error?.mensagem || 'Erro ao registrar entrada no estoque.';
        this.mensagemErro = `Falha no Estoque: ${msgApi}`;
        this.salvandoEntrada = false;
      }
    });
  }

  finalizarOperacao(): void {
    this.limparFormulario();
    this.carregarItens();
    this.salvandoEntrada = false;
  }

  limparFormulario(): void {
    this.entrada = {
      iditem: null,
      item: '',
      descricaoItem: '',
      preco: 0,
      tipoItem: 'P',
      idcategoria: this.categorias[0]?.idcategoria || this.categorias[0]?.Idcategoria || 1,
      quantidadeEntrada: 1,
      valorUnitarioEntrada: 0,
      dataEntradaProduto: new Date().toISOString().split('T')[0]
    };
  }

  sairAdmin(): void {
    sessionStorage.removeItem('adminAutenticado');
    this.router.navigate(['/inicio']);
  }
}