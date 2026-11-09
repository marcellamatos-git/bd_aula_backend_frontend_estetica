
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-meus-pedidos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './meus-pedidos.html',
  styleUrl: './meus-pedidos.css'
})
export class MeusPedidosComponent implements OnInit {

  clientes: any[] = [];
  idClienteSelecionado: number | null = null;

  pedidos: any[] = [];
  pedidoSelecionadoDetalhes: any = null;

  carregandoClientes = false;
  carregandoPedidos = false;

  mensagem = '';

  private apiUrlClientes = 'https://localhost:7000/api/Clientes';
  private apiUrlAtendimentos = 'https://localhost:7000/api/Atendimentos';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.carregarClientes();
  }

  carregarClientes(): void {
    this.carregandoClientes = true;

    this.http.get<any[]>(this.apiUrlClientes).subscribe({
      next: res => {
        this.clientes = res || [];
        this.carregandoClientes = false;
      },

      error: err => {
        console.error('Erro ao carregar clientes:', err);
        this.mensagem = 'Não foi possível carregar os clientes.';
        this.carregandoClientes = false;
      }
    });
  }

  buscarPedidosCliente(): void {
    this.pedidos = [];
    this.pedidoSelecionadoDetalhes = null;
    this.mensagem = '';

    if (!this.idClienteSelecionado) {
      return;
    }

    this.carregandoPedidos = true;

    const idPessoa = Number(this.idClienteSelecionado);

    this.http
      .get<any[]>(`${this.apiUrlAtendimentos}/pessoa/${idPessoa}`)
      .subscribe({
        next: res => {
          this.pedidos = res || [];

          if (this.pedidos.length === 0) {
            this.mensagem = 'Nenhum pedido encontrado para este cliente.';
          }

          this.carregandoPedidos = false;
        },

        error: err => {
          console.error('Erro ao buscar pedidos:', err);

          this.pedidos = [];
          this.mensagem = 'Não foi possível carregar os pedidos.';

          this.carregandoPedidos = false;
        }
      });
  }

  verDetalhes(pedido: any): void {
    this.pedidoSelecionadoDetalhes = pedido;
  }

  fecharDetalhes(): void {
    this.pedidoSelecionadoDetalhes = null;
  }

  calcularTotalPedido(pedido: any): number {
    if (!pedido?.itens) {
      return 0;
    }

    return pedido.itens.reduce(
      (total: number, item: any) =>
        total +
        (Number(item.quantidadeItens) * Number(item.valorUnitarioEntrada)),
      0
    );
  }

  formatarStatus(status: string): string {
    switch (String(status).toUpperCase()) {
      case 'A':
        return 'Em Aberto';

      case 'P':
        return 'Em Processamento';

      case 'C':
        return 'Concluído';

      case 'X':
        return 'Cancelado';

      default:
        return status || 'Em Aberto';
    }
  }
}
