
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CartService, ItemCarrinho } from '../../services/cart.service';

@Component({
  selector: 'app-carrinho',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './carrinho.html',
  styleUrl: './carrinho.css'
})
export class CarrinhoComponent implements OnInit {

  itens: ItemCarrinho[] = [];
  clientes: any[] = [];
  idClienteSelecionado: number | null = null;

  carregando = false;
  mensagemSucesso = '';
  mensagemErro = '';

  private apiUrlAtendimentos = 'https://localhost:7000/api/Atendimentos';
  private apiUrlClientes = 'https://localhost:7000/api/Clientes';

  constructor(
    private cartService: CartService,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.carregarCarrinho();
    this.carregarClientes();
  }

  carregarCarrinho(): void {
    this.itens = this.cartService.getItens();
  }

  carregarClientes(): void {
    this.http.get<any[]>(this.apiUrlClientes).subscribe({
      next: res => {
        this.clientes = res || [];
      },
      error: err => {
        console.error('Erro ao carregar clientes:', err);
        this.mensagemErro = 'Não foi possível carregar os clientes.';
      }
    });
  }

  alterarQuantidade(item: ItemCarrinho, delta: number): void {
    const novaQtd = item.quantidade + delta;

    if (
      item.tipoItem === 'P' &&
      item.quantidadeEstoque !== undefined &&
      novaQtd > item.quantidadeEstoque
    ) {
      this.mensagemErro = 'Quantidade máxima em estoque atingida!';
      return;
    }

    this.mensagemErro = '';

    this.cartService.atualizarQuantidade(item.iditem, novaQtd);
    this.carregarCarrinho();
  }

  remover(param: ItemCarrinho | number): void {
    const id = typeof param === 'number' ? param : param.iditem;

    this.cartService.removerItem(id);
    this.carregarCarrinho();
  }

  get total(): number {
    return this.cartService.getTotal();
  }

  private obterDataLocal(): string {
    const hoje = new Date();

    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    const dia = String(hoje.getDate()).padStart(2, '0');

    return `${ano}-${mes}-${dia}`;
  }

  finalizarPedido(): void {
    this.mensagemSucesso = '';
    this.mensagemErro = '';

    if (this.itens.length === 0) {
      this.mensagemErro = 'O seu carrinho está vazio.';
      return;
    }

    if (!this.idClienteSelecionado) {
      this.mensagemErro = 'Selecione um cliente para finalizar o pedido.';
      return;
    }

    this.carregando = true;

    const payloadAtendimento = {
      idpessoa: Number(this.idClienteSelecionado),
      dataAtendimento: this.obterDataLocal(),
      statusAtendimento: 'P',
      itens: this.itens.map(item => ({
        iditem: Number(item.iditem),
        idfuncionario: 1,
        quantidadeItens: Number(item.quantidade),
        valorUnitarioEntrada: Number(item.preco)
      }))
    };

    console.log('Pedido enviado:', payloadAtendimento);

    this.http.post(this.apiUrlAtendimentos, payloadAtendimento).subscribe({
      next: res => {
        console.log('Pedido registrado:', res);

        this.mensagemSucesso = 'Pedido realizado com sucesso!';

        this.cartService.limparCarrinho();
        this.carregarCarrinho();

        this.idClienteSelecionado = null;
        this.carregando = false;
      },

      error: err => {
        console.error('Erro ao registrar pedido:', err);

        if (err.error?.errors) {
          const detalhes = Object.values(err.error.errors)
            .flat()
            .join(' | ');

          this.mensagemErro = `Erro de validação: ${detalhes}`;
        } else if (typeof err.error === 'string') {
          this.mensagemErro = `Erro no backend: ${err.error}`;
        } else {
          this.mensagemErro =
            'Não foi possível registrar o pedido. Verifique o console e a API.';
        }

        this.carregando = false;
      }
    });
  }
}
