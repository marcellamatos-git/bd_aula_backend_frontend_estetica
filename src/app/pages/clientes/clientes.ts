
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import {
  ClientesService,
  ClienteCadastro
} from '../../services/clientes.service';

interface Cliente extends ClienteCadastro {
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
  clientesCadastrados: any[] = [];
  carregando = false;

  constructor(private clientesService: ClientesService) {}

  ngOnInit(): void {
    this.listarClientes();
  }
  limparFormulario(): void {
    this.cliente = this.novoCliente();
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
    this.clientesService.listarClientes().subscribe({
      next: (dados) => {
        this.clientesCadastrados = dados;
      },
      error: (erro) => {
        console.error('Erro ao listar clientes:', erro);
      }
    });
  }

  cadastrarCliente(): void {
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
  
    this.clientesService.cadastrarCliente(dados)
      .pipe(
        finalize(() => {
          this.carregando = false;
        })
      )
      .subscribe({
        next: () => {
          // Limpa o formulário após o cadastro confirmado
          this.cliente = this.novoCliente();
  
          this.mensagem = 'Cliente cadastrado com sucesso!';
          this.tipoMensagem = 'sucesso';
  
          // Atualiza a lista de clientes cadastrados
          this.listarClientes();
        },
        error: (erro) => {
          console.error('Erro ao cadastrar cliente:', erro);
  
          this.mensagem =
            erro.error?.mensagem ||
            erro.error?.message ||
            'Não foi possível cadastrar o cliente.';
  
          this.tipoMensagem = 'erro';
        }
      });
    }
 