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

  carregandoClientes: boolean = false;
  carregandoPedidos: boolean = false;
  mensagem: string = '';

  private apiUrlClientes = 'https://localhost:7000/api/Clientes';
  private apiUrlAtendimentos = 'https://localhost:7000/api/Atendimentos';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.carregarClientes();
  }

  carregarClientes() {
    this.carregandoClientes = true;
    this.http.get<any[]>(this.apiUrlClientes).subscribe({
      next: (res) => {
        this.clientes = res || [];
        this.carregandoClientes = false;
      },
      error: (err) => {
        console.error('Erro ao carregar clientes:', err);
        this.carregandoClientes = false;
      }
    });
  }

  buscarPedidosCliente() {
    this.pedidoSelecionadoDetalhes = null;
    this.mensagem = '';

    if (!this.idClienteSelecionado) {
      this.pedidos = [];
      return;
    }

    this.carregandoPedidos = true;
    // Tenta obter os pedidos do cliente selecionado
    this.http.get<any[]>(`${this.apiUrlAtendimentos}`).subscribe({
      next: (res) => {
        const todosAtendimentos = res || [];
        // Filtra os atendimentos/pedidos do cliente selecionado
        this.pedidos = todosAtendimentos.filter(a => 
          (a.idpessoa == this.idClienteSelecionado) || (a.idCliente == this.idClienteSelecionado)
        );

        if (this.pedidos.length === 0) {
          this.mensagem = 'Nenhum pedido encontrado para o cliente selecionado.';
        }
        this.carregandoPedidos = false;
      },
      error: (err) => {
        console.error('Erro ao buscar pedidos:', err);
        this.pedidos = [];
        this.mensagem = 'Não foi possível carregar os pedidos.';
        this.carregandoPedidos = false;
      }
    });
  }

  verDetalhes(pedido: any) {
    this.pedidoSelecionadoDetalhes = pedido;
  }

  fecharDetalhes() {
    this.pedidoSelecionadoDetalhes = null;
  }

  formatarStatus(status: string): string {
    switch (String(status).toUpperCase()) {
      case 'A': return 'Em Aberto';
      case 'P': return 'Em Processamento';
      case 'C': return 'Concluído';
      case 'X': return 'Cancelado';
      default: return status || 'Em Aberto';
    }
  }
}