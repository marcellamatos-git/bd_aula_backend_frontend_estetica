
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import {
  ClientesService,
  ClienteCadastro
} from '../../services/clientes.service';

interface Cliente extends ClienteCadastro {
  idpessoa?: number;
  logradouro: string;
  bairro: string;
  cidade: string;
  uf: string;
}

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './clientes.html',
  styleUrl: './clientes.css'
})
export class Clientes implements OnInit {

  cliente: Cliente = this.novoCliente();

  mensagem = '';
  tipoMensagem: 'sucesso' | 'erro' | '' = '';

  clientesCadastrados: Cliente[] = [];

  carregando = false;
  carregandoLista = false;

  // Guarda o ID do cliente que está sendo editado.
  idClienteEdicao: number | null = null;

  constructor(private clientesService: ClientesService) {}

  ngOnInit(): void {
    this.listarClientes();
  }

  private novoCliente(): Cliente {
    return {
      nome: '',
      cpf: 0,
      dataNascimento: '',
      sexo: '',
      email: '',
      telefone: 0,
      cep: '',
      numero: '',
      complemento: '',
      logradouro: '',
      bairro: '',
      cidade: '',
      uf: ''
    };
  }

  listarClientes(): void {
    this.carregandoLista = true;

    this.clientesService.listarClientes()
      .pipe(
        finalize(() => {
          this.carregandoLista = false;
        })
      )
      .subscribe({
        next: (dados) => {
          this.clientesCadastrados = Array.isArray(dados)
            ? dados
            : [];
        },
        error: (erro) => {
          console.error('Erro ao listar clientes:', erro);
          this.mensagem = 'Não foi possível carregar os clientes.';
          this.tipoMensagem = 'erro';
        }
      });
  }

  cadastrarCliente(): void {
    if (this.carregando) {
      return;
    }

    this.mensagem = '';
    this.tipoMensagem = '';

    if (
      !this.cliente.nome.trim() ||
      !this.cliente.cpf ||
      !this.cliente.email.trim()
    ) {
      this.mensagem = 'Preencha o nome, o CPF e o e-mail.';
      this.tipoMensagem = 'erro';
      return;
    }

    if (!/^\d{8}$/.test(this.cliente.cep)) {
      this.mensagem = 'O CEP deve conter exatamente 8 números.';
      this.tipoMensagem = 'erro';
      return;
    }

    const dados: ClienteCadastro = {
      nome: this.cliente.nome.trim(),
      cpf: Number(this.cliente.cpf),
      dataNascimento: this.cliente.dataNascimento,
      sexo: this.cliente.sexo,
      email: this.cliente.email.trim(),
      telefone: Number(this.cliente.telefone),
      cep: this.cliente.cep,
      numero: this.cliente.numero,
      complemento: this.cliente.complemento
    };

    this.carregando = true;

    // Se existe ID, atualiza. Caso contrário, cadastra.
    const requisicao = this.idClienteEdicao !== null
      ? this.clientesService.atualizarCliente(this.idClienteEdicao, dados)
      : this.clientesService.cadastrarCliente(dados);

    requisicao
      .pipe(
        finalize(() => {
          this.carregando = false;
        })
      )
      .subscribe({
        next: () => {
          if (this.idClienteEdicao !== null) {
            this.mensagem = 'Cliente atualizado com sucesso!';
          } else {
            this.mensagem = 'Cliente cadastrado com sucesso!';
          }

          this.tipoMensagem = 'sucesso';

          this.cancelarEdicao();
          this.listarClientes();
        },
        error: (erro) => {
          console.error('Erro ao salvar cliente:', erro);

          this.mensagem =
            erro.error?.message ||
            erro.error?.title ||
            'Não foi possível salvar o cliente.';

          this.tipoMensagem = 'erro';
        }
      });
  }

  editarCliente(cliente: Cliente): void {
    if (!cliente.idpessoa) {
      this.mensagem = 'Não foi possível identificar o cliente.';
      this.tipoMensagem = 'erro';
      return;
    }

    this.idClienteEdicao = cliente.idpessoa;

    this.cliente = {
      ...this.novoCliente(),
      ...cliente
    };

    this.mensagem = 'Editando cliente: ' + cliente.nome;
    this.tipoMensagem = 'sucesso';
  }

  excluirCliente(cliente: Cliente): void {
    if (!cliente.idpessoa) {
      this.mensagem = 'Não foi possível identificar o cliente.';
      this.tipoMensagem = 'erro';
      return;
    }

    const confirmar = confirm(
      `Deseja realmente excluir o cliente ${cliente.nome}?`
    );

    if (!confirmar) {
      return;
    }

    this.clientesService.excluirCliente(cliente.idpessoa).subscribe({
      next: () => {
        this.mensagem = 'Cliente excluído com sucesso!';
        this.tipoMensagem = 'sucesso';

        if (this.idClienteEdicao === cliente.idpessoa) {
          this.cancelarEdicao();
        }

        this.listarClientes();
      },
      error: (erro) => {
        console.error('Erro ao excluir cliente:', erro);

        this.mensagem =
          erro.error?.message ||
          erro.error?.title ||
          'Não foi possível excluir o cliente.';

        this.tipoMensagem = 'erro';
      }
    });
  }

  cancelarEdicao(): void {
    this.idClienteEdicao = null;
    this.cliente = this.novoCliente();
  }

  limparFormulario(): void {
    this.cancelarEdicao();
    this.mensagem = '';
    this.tipoMensagem = '';
  }
}
