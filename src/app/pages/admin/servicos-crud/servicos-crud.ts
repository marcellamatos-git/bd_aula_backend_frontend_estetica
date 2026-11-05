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

  // Variável que o HTML verifica para saber se está editando
  idServicoEdicao: number | null = null;
  salvando: boolean = false;

  servico = {
    iditem: null as number | null,
    item: '',
    descricaoItem: '',
    preco: 0,
    idcategoria: null as number | null,
    tipoItem: 'S', // 'S' para Serviço
    ativoProdutoServico: 'A'
  };

  mensagemSucesso: string = '';
  mensagemErro: string = '';

  private apiUrlItens = 'https://localhost:7000/api/Itens';
  private apiUrlCategorias = 'https://localhost:7000/api/Categorias';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.carregarServicos();
    this.carregarCategorias();
  }

  carregarServicos() {
    this.http.get<any[]>(this.apiUrlItens).subscribe({
      next: (res) => {
        const lista = res || [];
        this.servicos = lista.filter(i => String(i.tipoItem || i.tipo || '').toUpperCase() === 'S');
      },
      error: (err) => console.error('Erro ao carregar serviços:', err)
    });
  }

  carregarCategorias() {
    this.http.get<any[]>(this.apiUrlCategorias).subscribe({
      next: (res) => this.categorias = res || [],
      error: (err) => console.error('Erro ao carregar categorias:', err)
    });
  }

  salvarServico() {
    this.mensagemSucesso = '';
    this.mensagemErro = '';

    if (!this.servico.item || this.servico.preco <= 0) {
      this.mensagemErro = 'Preencha o nome do serviço e informe um preço válido.';
      return;
    }

    this.salvando = true;

    const payload = {
      iditem: this.idServicoEdicao ? Number(this.idServicoEdicao) : 0,
      item: this.servico.item,
      descricaoItem: this.servico.descricaoItem,
      preco: Number(this.servico.preco),
      idcategoria: this.servico.idcategoria ? Number(this.servico.idcategoria) : 1,
      tipoItem: 'S',
      ativoProdutoServico: this.servico.ativoProdutoServico
    };

    if (this.idServicoEdicao) {
      this.http.put(`${this.apiUrlItens}/${this.idServicoEdicao}`, payload).subscribe({
        next: () => {
          this.mensagemSucesso = 'Serviço atualizado com sucesso!';
          this.limparFormulario();
          this.carregarServicos();
          this.salvando = false;
        },
        error: (err) => {
          console.error('Erro ao atualizar serviço:', err);
          this.mensagemErro = 'Erro ao atualizar o serviço. Verifique os dados enviados.';
          this.salvando = false;
        }
      });
    } else {
      this.http.post(this.apiUrlItens, payload).subscribe({
        next: () => {
          this.mensagemSucesso = 'Serviço cadastrado com sucesso!';
          this.limparFormulario();
          this.carregarServicos();
          this.salvando = false;
        },
        error: (err) => {
          console.error('Erro ao cadastrar serviço:', err);
          this.mensagemErro = 'Erro ao cadastrar o serviço. Verifique se os dados são válidos.';
          this.salvando = false;
        }
      });
    }
  }

  editar(s: any) {
    this.idServicoEdicao = s.iditem || s.id;
    this.servico = {
      iditem: this.idServicoEdicao,
      item: s.item || s.nome,
      descricaoItem: s.descricaoItem || s.descricao || '',
      preco: s.preco || 0,
      idcategoria: s.idcategoria || null,
      tipoItem: 'S',
      ativoProdutoServico: s.ativoProdutoServico || 'A'
    };
  }

  desativar(id: number) {
    if (confirm('Deseja alterar o status / desativar este serviço?')) {
      this.http.delete(`${this.apiUrlItens}/${id}`).subscribe({
        next: () => {
          this.mensagemSucesso = 'Serviço alterado com sucesso!';
          this.carregarServicos();
        },
        error: (err) => console.error('Erro ao alterar serviço:', err)
      });
    }
  }

  limparFormulario() {
    this.idServicoEdicao = null;
    this.salvando = false;
    this.servico = {
      iditem: null,
      item: '',
      descricaoItem: '',
      preco: 0,
      idcategoria: null,
      tipoItem: 'S',
      ativoProdutoServico: 'A'
    };
  }
}