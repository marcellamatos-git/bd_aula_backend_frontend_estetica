
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './clientes.html',
  styleUrl: './clientes.css'
})
export class ClientesComponent implements OnInit {

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

  clientesCadastrados: any[] = [];

  idClienteEdicao: number | null = null;

  mostrarLista = false;

  carregando = false;
  carregandoLista = false;

  mensagem = '';
  tipoMensagem: 'sucesso' | 'erro' | '' = '';

  private apiUrl = 'https://localhost:7000/api/Clientes';

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.mostrarLista =
      this.route.snapshot.data['mostrarLista'] === true;

    if (this.mostrarLista) {
      this.carregarClientes();
    }
  }

  carregarClientes(): void {

    if (!this.mostrarLista) {
      return;
    }

    this.carregandoLista = true;

    this.http.get<any[]>(this.apiUrl).subscribe({

      next: (res) => {
        this.clientesCadastrados = res || [];
        this.carregandoLista = false;
      },

      error: (err) => {
        console.error('Erro ao carregar clientes:', err);

        this.clientesCadastrados = [];
        this.carregandoLista = false;
      }

    });
  }

  cadastrarCliente(): void {

    this.mensagem = '';
    this.tipoMensagem = '';
    this.carregando = true;

    if (this.idClienteEdicao !== null) {

      this.http.put(
        `${this.apiUrl}/${this.idClienteEdicao}`,
        this.cliente
      ).subscribe({

        next: () => {

          this.mensagem = 'Cliente atualizado com sucesso!';
          this.tipoMensagem = 'sucesso';

          this.limparFormulario();

          if (this.mostrarLista) {
            this.carregarClientes();
          }

        },

        error: (err) => {

          console.error('Erro ao atualizar cliente:', err);

          this.mensagem = 'Não foi possível atualizar o cliente.';
          this.tipoMensagem = 'erro';

          this.carregando = false;

        }

      });

    } else {

      this.http.post(this.apiUrl, this.cliente).subscribe({

        next: () => {

          this.mensagem = 'Cadastro realizado com sucesso!';
          this.tipoMensagem = 'sucesso';

          this.limparFormulario();

          if (this.mostrarLista) {
            this.carregarClientes();
          }

        },

        error: (err) => {

          console.error('Erro ao cadastrar cliente:', err);

          this.mensagem = 'Não foi possível realizar o cadastro.';
          this.tipoMensagem = 'erro';

          this.carregando = false;

        }

      });

    }
  }

  editarCliente(cliente: any): void {

    const id = cliente.idpessoa ?? cliente.Idpessoa ?? cliente.id;

    if (!id) {
      this.mensagem = 'Não foi possível identificar o cliente.';
      this.tipoMensagem = 'erro';
      return;
    }

    this.idClienteEdicao = Number(id);

    this.cliente = {
      nome: cliente.nome ?? cliente.Nome ?? '',
      cpf: cliente.cpf ?? cliente.Cpf ?? '',
      dataNascimento: cliente.dataNascimento ?? cliente.DataNascimento ?? '',
      sexo: cliente.sexo ?? cliente.Sexo ?? '',
      email: cliente.email ?? cliente.Email ?? '',
      telefone: cliente.telefone ?? cliente.Telefone ?? '',
      cep: cliente.cep ?? cliente.Cep ?? '',
      logradouro: cliente.logradouro ?? cliente.Logradouro ?? '',
      numero: cliente.numero ?? cliente.Numero ?? '',
      complemento: cliente.complemento ?? cliente.Complemento ?? '',
      bairro: cliente.bairro ?? cliente.Bairro ?? '',
      cidade: cliente.cidade ?? cliente.Cidade ?? '',
      uf: cliente.uf ?? cliente.Uf ?? ''
    };

    this.mensagem = 'Editando cadastro do cliente.';
    this.tipoMensagem = '';
  }

  excluirCliente(cliente: any): void {

    const id = cliente.idpessoa ?? cliente.Idpessoa ?? cliente.id;

    if (!id) {
      this.mensagem = 'Não foi possível identificar o cliente.';
      this.tipoMensagem = 'erro';
      return;
    }

    if (!confirm(`Deseja realmente excluir o cliente ${cliente.nome ?? cliente.Nome}?`)) {
      return;
    }

    this.http.delete(`${this.apiUrl}/${id}`).subscribe({

      next: () => {

        this.mensagem = 'Cliente excluído com sucesso!';
        this.tipoMensagem = 'sucesso';

        this.carregarClientes();

      },

      error: (err) => {

        console.error('Erro ao excluir cliente:', err);

        this.mensagem = 'Não foi possível excluir o cliente.';
        this.tipoMensagem = 'erro';

      }

    });
  }

  limparFormulario(): void {

    this.idClienteEdicao = null;

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

    this.carregando = false;

  }

}
