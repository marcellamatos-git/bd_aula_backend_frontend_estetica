import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

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
  pedidoSelecionado: any = null;
  exibirModalItens: boolean = false;
  
  carregando: boolean = false;
  mensagemSucesso: string = '';
  mensagemErro: string = '';
  statusFiltro: string = 'TODOS';

  get filtroSituacao(): string {
    return this.statusFiltro;
  }
  set filtroSituacao(val: string) {
    this.statusFiltro = val;
  }

  private apiUrlAtendimentos = 'https://localhost:7000/api/Atendimentos';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.carregarPedidos();
  }

  carregarPedidos(): void {
    this.carregando = true;
    this.mensagemErro = '';
    
    this.http.get<any[]>(this.apiUrlAtendimentos).subscribe({
      next: (res) => {
        this.pedidos = (res || []).map(p => this.normalizarAtendimento(p));
        this.aplicarFiltro();
        this.carregando = false;
      },
      error: (err) => {
        console.error('Erro ao carregar atendimentos:', err);
        this.mensagemErro = 'Não foi possível carregar a lista de atendimentos.';
        this.carregando = false;
      }
    });
  }

  normalizarAtendimento(p: any): any {
    const rawItens = p.itens || p.Itens || p.atendimentoitems || p.Atendimentoitems || [];
    
    const itensFormatados = rawItens.map((i: any) => ({
      iditem: i.iditem ?? i.Iditem ?? i.idItem,
      nomeItem: i.nomeItem ?? i.NomeItem ?? i.item1 ?? i.Item1 ?? (i.iditemNavigation?.item1) ?? (i.IditemNavigation?.Item1) ?? `Item #${i.iditem || i.Iditem || '1'}`,
      quantidadeItens: Number(i.quantidadeItens ?? i.QuantidadeItens ?? i.quantidade ?? 1),
      valorUnitarioEntrada: Number(i.valorUnitarioEntrada ?? i.ValorUnitarioEntrada ?? i.preco ?? 0),
      idfuncionario: i.idfuncionario ?? i.Idfuncionario ?? 1
    }));

    return {
      ...p,
      idatendimento: p.idatendimento ?? p.Idatendimento ?? p.idAtendimento,
      idpessoa: p.idpessoa ?? p.Idpessoa,
      nomePessoa: p.nomePessoa ?? p.NomePessoa ?? `Cliente #${p.idpessoa}`,
      dataAtendimento: p.dataAtendimento ?? p.DataAtendimento,
      statusAtendimento: p.statusAtendimento ?? p.StatusAtendimento ?? 'A',
      itens: itensFormatados
    };
  }

  aplicarFiltro(): void {
    if (!this.statusFiltro || this.statusFiltro === 'TODOS') {
      this.pedidosFiltrados = [...this.pedidos];
    } else {
      this.pedidosFiltrados = this.pedidos.filter(p => {
        const st = (p.statusAtendimento || 'A').toUpperCase();
        return st === this.statusFiltro.toUpperCase();
      });
    }
  }

  verItensPedido(idAtendimento: number): void {
    this.http.get<any>(`${this.apiUrlAtendimentos}/${idAtendimento}`).subscribe({
      next: (res) => {
        this.pedidoSelecionado = this.normalizarAtendimento(res);
        this.exibirModalItens = true;
      },
      error: (err) => {
        console.error('Erro ao buscar detalhes:', err);
        this.mensagemErro = 'Erro ao buscar itens do pedido.';
      }
    });
  }

  formatarStatus(status: string): string {
    if (!status) return 'Aberto';
    const s = String(status).toUpperCase();
    if (s === 'A' || s === 'ABERTO') return 'Aberto';
    if (s === 'C' || s === 'CONCLUÍDO' || s === 'CONCLUIDO') return 'Concluído';
    if (s === 'F' || s === 'FINALIZADO' || s === 'FATURADO') return 'Finalizado';
    return status;
  }

  atualizarStatus(pedido: any, novoStatus: string): void {
    if (!pedido || !novoStatus) return;

    const payloadAtualizacao = {
      idpessoa: pedido.idpessoa,
      dataAtendimento: pedido.dataAtendimento,
      statusAtendimento: novoStatus,
      itens: (pedido.itens || []).map((i: any) => ({
        iditem: i.iditem,
        idfuncionario: i.idfuncionario || 1,
        quantidadeItens: i.quantidadeItens,
        valorUnitarioEntrada: i.valorUnitarioEntrada
      }))
    };

    const id = pedido.idatendimento;
    this.http.put(`${this.apiUrlAtendimentos}/${id}`, payloadAtualizacao).subscribe({
      next: () => {
        pedido.statusAtendimento = novoStatus;
        this.mensagemSucesso = `Status atualizado com sucesso!`;
        setTimeout(() => this.mensagemSucesso = '', 4000);
        this.carregarPedidos();
      },
      error: (err) => {
        console.error('Erro ao atualizar status:', err);
        this.mensagemErro = 'Falha ao atualizar o status do pedido.';
        setTimeout(() => this.mensagemErro = '', 4000);
      }
    });
  }

  calcularTotalPedido(itens: any[]): number {
    if (!itens || itens.length === 0) return 0;
    return itens.reduce((acc, item) => acc + (Number(item.quantidadeItens || 1) * Number(item.valorUnitarioEntrada || 0)), 0);
  }

  fecharModal(): void {
    this.exibirModalItens = false;
    this.pedidoSelecionado = null;
  }
}