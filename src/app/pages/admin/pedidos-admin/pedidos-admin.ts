import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-pedidos-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pedidos-admin.html',
  styleUrl: './pedidos-admin.css'
})
export class PedidosAdminComponent implements OnInit {
  pedidos: any[] = [];
  pedidosFiltrados: any[] = [];
  statusFiltro: string = '';
  pedidoDetalhes: any = null;

  carregando: boolean = false;
  mensagemSucesso: string = '';
  mensagemErro: string = '';

  private apiUrlAtendimentos = 'https://localhost:7000/api/Atendimentos';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.carregarPedidos();
  }

  carregarPedidos() {
    this.carregando = true;
    this.http.get<any[]>(this.apiUrlAtendimentos).subscribe({
      next: (res) => {
        this.pedidos = res || [];
        this.aplicarFiltro();
        this.carregando = false;
      },
      error: (err) => {
        console.error('Erro ao carregar pedidos:', err);
        this.carregando = false;
      }
    });
  }

  aplicarFiltro() {
    if (!this.statusFiltro) {
      this.pedidosFiltrados = [...this.pedidos];
    } else {
      this.pedidosFiltrados = this.pedidos.filter(p => 
        String(p.statusAtendimento || 'A').toUpperCase() === this.statusFiltro.toUpperCase()
      );
    }
  }

  atualizarStatus(pedido: any, novoStatus: string) {
    this.mensagemSucesso = '';
    this.mensagemErro = '';

    const payload = {
      ...pedido,
      statusAtendimento: novoStatus
    };

    const id = pedido.idatendimento || pedido.id;

    this.http.put(`${this.apiUrlAtendimentos}/${id}`, payload).subscribe({
      next: () => {
        this.mensagemSucesso = `Status do pedido #${id} atualizado com sucesso!`;
        this.carregarPedidos();
        if (this.pedidoDetalhes) this.fecharDetalhes();
      },
      error: (err) => {
        console.error('Erro ao atualizar status:', err);
        this.mensagemErro = 'Não foi possível atualizar o status do pedido.';
      }
    });
  }

  verDetalhes(p: any) {
    this.pedidoDetalhes = p;
  }

  fecharDetalhes() {
    this.pedidoDetalhes = null;
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