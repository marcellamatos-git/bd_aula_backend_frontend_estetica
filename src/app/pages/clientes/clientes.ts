
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

interface Cliente {
  nome: string;
  cpf: string;
  dataNascimento: string;
  sexo: string;
  email: string;
  telefone: string;
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string;
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
export class Clientes {
  cliente: Cliente = this.novoCliente();

  mensagem = '';
  tipoMensagem: 'sucesso' | 'erro' | '' = '';

  private novoCliente(): Cliente {
    return {
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

  cadastrarCliente(): void {
    this.mensagem = '';
    this.tipoMensagem = '';

    if (
      !this.cliente.nome.trim() ||
      !this.cliente.cpf.trim() ||
      !this.cliente.email.trim()
    ) {
      this.mensagem = 'Preencha o nome, o CPF e o e-mail.';
      this.tipoMensagem = 'erro';
      return;
    }

    this.mensagem =
      'Formulário validado! A integração com a API será feita na próxima etapa.';
    this.tipoMensagem = 'sucesso';
  }

  limparFormulario(): void {
    this.cliente = this.novoCliente();
    this.mensagem = '';
    this.tipoMensagem = '';
  }
}
