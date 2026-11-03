import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './clientes.html',
  styleUrl: './clientes.css'
})
export class ClientesComponent implements OnInit {
  // Modelo dos campos do formulário
  cliente: any = {
    nome: '',
    cpf: '',
    dataNascimento: '',
    sexo: '',
    email: '',
    telefone: '',
    cep: '',
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    uf: ''
  };

  // Variáveis exigidas pelo teu HTML
  clientesCadastrados: any[] = [];
  idClienteEdicao: number | null = null;
  carregando: boolean = false;
  carregandoLista: boolean = false;
  mensagem: string = '';
  tipoMensagem: 'sucesso' | 'erro' | '' = '';

  private apiUrl = 'https://localhost:7000/api/Clientes';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.carregarClientes();
  }

  // Lista clientes do backend
  carregarClientes() {
    this.carregandoLista = true;
    this.http.get<any[]>(this.apiUrl).subscribe({
      next: (res) => {
        this.clientesCadastrados = res || [];
        this.carregandoLista = false;
      },
      error: (err) => {
        console.error('Erro ao buscar clientes:', err);
        this.clientesCadastrados = [];
        this.carregandoLista = false;
      }
    });
  }

  // Ação de cadastrar/salvar (atende ao formulario do HTML)
  cadastrarCliente() {
    this.mensagem = '';
    this.carregando = true;

    if (this.idClienteEdicao !== null) {
      // Atualizar
      this.http.put(`${this.apiUrl}/${this.idClienteEdicao}`, this.cliente).subscribe({
        next: () => {
          this.mensagem = 'Cliente atualizado com sucesso!';
          this.tipoMensagem = 'sucesso';
          this.limparFormulario();
          this.carregarClientes();
        },
        error: () => {
          this.mensagem = 'Erro ao atualizar cliente.';
          this.tipoMensagem = 'erro';
          this.carregando = false;
        }
      });
    } else {
      // Criar novo
      this.http.post(this.apiUrl, this.cliente).subscribe({
        next: () => {
          this.mensagem = 'Cliente cadastrado com sucesso!';
          this.tipoMensagem = 'sucesso';
          this.limparFormulario();
          this.carregarClientes();
        },
        error: () => {
          this.mensagem = 'Erro ao cadastrar cliente. Verifique os dados.';
          this.tipoMensagem = 'erro';
          this.carregando = false;
        }
      });
    }
  }

  // Preenche formulário ao clicar em editar na tabela
  editarCliente(c: any) {
    this.idClienteEdicao = c.idpessoa || c.id || null;
    this.cliente = { ...c };
  }

  // Exclui ao clicar em excluir na tabela
  excluirCliente(c: any) {
    const id = c.idpessoa || c.id;
    if (confirm(`Deseja excluir ${c.nome}?`)) {
      this.http.delete(`${this.apiUrl}/${id}`).subscribe({
        next: () => {
          this.carregarClientes();
        },
        error: (err) => console.error('Erro ao excluir:', err)
      });
    }
  }

  // Reseta formulário
  limparFormulario() {
    this.idClienteEdicao = null;
    this.carregando = false;
    this.cliente = {
      nome: '',
      cpf: '',
      dataNascimento: '',
      sexo: '',
      email: '',
      telefone: '',
      cep: '',
      logradouro: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidade: '',
      uf: ''
    };
  }
}