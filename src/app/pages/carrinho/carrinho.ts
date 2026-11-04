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

  remover(param: ItemCarrinho | number) {
    const id = typeof param === 'number' ? param : param.iditem;
    this.cartService.removerItem(id);
    this.carregarCarrinho();
  }

  get total(): number {
    return this.cartService.getTotal();
  }

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

    const idCliente = Number(this.idClienteSelecionado);

    // Payload estruturado estritamente conforme o modelo de banco 'atendimento' e 'atendimentoitem'
    const payloadAtendimento = {
      idpessoa: idCliente,
      dataAtendimento: new Date().toISOString().split('T')[0], // Envia em formato DATE YYYY-MM-DD
      statusAtendimento: 'A',
      atendimentoItens: this.itens.map(item => ({
        iditem: Number(item.iditem),
        idfuncionario: 1, // Funcionário padrão (FK obrigatória no MySQL)
        quantidadeItens: Number(item.quantidade),
        valorUnitarioEntrada: Number(item.preco)
      }))
    };

    console.log('Payload enviado para /api/Atendimentos:', payloadAtendimento);

    this.http.post(this.apiUrlAtendimentos, payloadAtendimento).subscribe({
      next: (res) => {
        console.log('Atendimento criado com sucesso:', res);
        this.mensagemSucesso = 'Pedido/Atendimento registrado com sucesso!';
        this.cartService.limparCarrinho();
        this.carregarCarrinho();
        this.carregando = false;
      },
      error: (err) => {
        console.error('Erro detalhado da API:', err);

        if (err.error && typeof err.error === 'object' && err.error.errors) {
          const detalhes = Object.values(err.error.errors).flat().join(' | ');
          this.mensagemErro = `Erro de validação: ${detalhes}`;
        } else if (typeof err.error === 'string') {
          this.mensagemErro = `Erro no backend: ${err.error}`;
        } else {
          this.mensagemErro = 'Erro ao registrar pedido. Verifique o console do navegador (F12) e a API C#.';
        }

        this.carregando = false;
      }
    });
  }
}