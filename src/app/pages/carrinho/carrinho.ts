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

  carregando: boolean = false;
  mensagemSucesso: string = '';
  mensagemErro: string = '';

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

  carregarCarrinho() {
    this.itens = this.cartService.getItens();
  }

  carregarClientes() {
    this.http.get<any[]>(this.apiUrlClientes).subscribe({
      next: (res) => this.clientes = res || [],
      error: (err) => console.error('Erro ao carregar clientes:', err)
    });
  }

  alterarQuantidade(item: ItemCarrinho, delta: number) {
    const novaQtd = item.quantidade + delta;
    this.cartService.atualizarQuantidade(item.iditem, novaQtd);
    this.carregarCarrinho();
  }

  // Aceita tanto o ID (number) quanto o objeto item para evitar erros no HTML
  remover(param: ItemCarrinho | number) {
    const id = typeof param === 'number' ? param : param.iditem;
    this.cartService.removerItem(id);
    this.carregarCarrinho();
  }

  get total(): number {
    return this.cartService.getTotal();
  }

  // Função para registar o atendimento/pedido na base de dados
  finalizarPedido() {
    this.mensagemSucesso = '';
    this.mensagemErro = '';

    if (this.itens.length === 0) {
      this.mensagemErro = 'O seu carrinho está vazio.';
      return;
    }

    if (!this.idClienteSelecionado) {
      this.mensagemErro = 'Por favor, selecione um cliente para finalizar o pedido.';
      return;
    }

    this.carregando = true;

    // Estrutura do DTO para enviar à API
    const payloadAtendimento = {
      idpessoa: this.idClienteSelecionado,
      dataAtendimento: new Date().toISOString(),
      statusAtendimento: 'A', // A = Aberto
      itens: this.itens.map(item => ({
        iditem: item.iditem,
        quantidadeItens: item.quantidade,
        valorUnitarioEntrada: item.preco
      }))
    };

    this.http.post(this.apiUrlAtendimentos, payloadAtendimento).subscribe({
      next: () => {
        this.mensagemSucesso = 'Pedido/Atendimento registado com sucesso!';
        this.cartService.limparCarrinho();
        this.carregarCarrinho();
        this.carregando = false;
      },
      error: (err) => {
        console.error('Erro ao finalizar pedido:', err);
        this.mensagemErro = 'Erro ao registar pedido. Verifique se o backend está em execução.';
        this.carregando = false;
      }
    });
  }
}