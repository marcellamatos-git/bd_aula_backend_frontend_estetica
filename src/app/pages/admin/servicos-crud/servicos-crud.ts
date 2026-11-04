import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-servicos-crud',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './servicos-crud.html',
  styleUrl: './servicos-crud.css'
})
export class ServicosCrudComponent implements OnInit {
  servicos: any[] = [];
  categorias: any[] = [];
  idServicoEdicao: number | null = null;

  servico: any = {
    item: '',
    descricaoItem: '',
    idcategoria: null,
    preco: 0,
    tipoItem: 'S', // 'S' para Serviço
    ativoProdutoServico: 'S'
  };

  carregando: boolean = false;
  salvando: boolean = false;
  mensagemSucesso: string = '';
  mensagemErro: string = '';

  private apiUrlItens = 'https://localhost:7000/api/Itens';
  private apiUrlCategorias = 'https://localhost:7000/api/Categorias';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.carregarCategorias();
    this.carregarServicos();
  }

  carregarCategorias() {
    this.http.get<any[]>(this.apiUrlCategorias).subscribe({
      next: (res) => this.categorias = res || [],
      error: (err) => console.error('Erro ao buscar categorias:', err)
    });
  }

  carregarServicos() {
    this.carregando = true;
    this.http.get<any[]>(this.apiUrlItens).subscribe({
      next: (res) => {
        const listaBruta = res || [];
        this.servicos = listaBruta
          .filter(i => {
            const tipo = String(i.tipoItem || i.tipo || i.tipo_item || '').toUpperCase();
            return tipo === 'S';
          })
          .map(i => ({
            iditem: i.iditem || i.id || i.idItem,
            item: i.item || i.nome || i.nomeItem || 'Serviço sem nome',
            descricaoItem: i.descricaoItem || i.descricao || '',
            idcategoria: i.idcategoria || i.idCategoria,
            categoria: i.categoria || i.nomeCategoria || 'Estética',
            preco: i.preco || i.precoVenda || i.preco_venda || 0,
            ativoProdutoServico: i.ativoProdutoServico || i.ativo || 'S',
            dadoOriginal: i
          }));

        this.carregando = false;
      },
      error: (err) => {
        console.error('Erro ao carregar serviços:', err);
        this.mensagemErro = 'Erro ao ligar à API de serviços.';
        this.carregando = false;
      }
    });
  }

  salvarServico() {
    this.mensagemSucesso = '';
    this.mensagemErro = '';

    if (!this.servico.item) {
      this.mensagemErro = 'Por favor, informe o nome do serviço.';
      return;
    }

    this.salvando = true;

    const payload = {
      item: this.servico.item,
      nome: this.servico.item,
      descricaoItem: this.servico.descricaoItem,
      descricao: this.servico.descricaoItem,
      idcategoria: Number(this.servico.idcategoria) || 1,
      preco: Number(this.servico.preco),
      precoVenda: Number(this.servico.preco),
      tipoItem: 'S',
      ativoProdutoServico: 'S'
    };

    if (this.idServicoEdicao !== null) {
      this.http.put(`${this.apiUrlItens}/${this.idServicoEdicao}`, payload).subscribe({
        next: () => {
          this.mensagemSucesso = 'Serviço atualizado com sucesso!';
          this.limparFormulario();
          this.carregarServicos();
        },
        error: (err) => {
          console.error('Erro ao atualizar serviço:', err);
          this.mensagemErro = 'Erro ao atualizar serviço.';
          this.salvando = false;
        }
      });
    } else {
      this.http.post(this.apiUrlItens, payload).subscribe({
        next: () => {
          this.mensagemSucesso = 'Serviço cadastrado com sucesso!';
          this.limparFormulario();
          this.carregarServicos();
        },
        error: (err) => {
          console.error('Erro ao cadastrar serviço:', err);
          this.mensagemErro = 'Erro ao cadastrar serviço.';
          this.salvando = false;
        }
      });
    }
  }

  editarServico(s: any) {
    this.idServicoEdicao = s.iditem;
    this.servico = {
      item: s.item,
      descricaoItem: s.descricaoItem,
      idcategoria: s.idcategoria,
      preco: s.preco,
      tipoItem: 'S',
      ativoProdutoServico: s.ativoProdutoServico
    };
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  desativarServico(s: any) {
    if (confirm(`Deseja desativar o serviço "${s.item}"?`)) {
      const payload = { ...s.dadoOriginal, ativoProdutoServico: 'N', ativo: 'N' };
      this.http.put(`${this.apiUrlItens}/${s.iditem}`, payload).subscribe({
        next: () => this.carregarServicos(),
        error: (err) => console.error('Erro ao desativar serviço:', err)
      });
    }
  }

  limparFormulario() {
    this.idServicoEdicao = null;
    this.salvando = false;
    this.servico = {
      item: '',
      descricaoItem: '',
      idcategoria: null,
      preco: 0,
      tipoItem: 'S',
      ativoProdutoServico: 'S'
    };
  }
}