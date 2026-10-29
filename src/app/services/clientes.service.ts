
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ClienteCadastro {
  nome: string;
  cpf: number;
  dataNascimento: string;
  sexo: string;
  email: string;
  telefone: number;
  cep: string;
  numero: string;
  complemento: string;
}

@Injectable({
  providedIn: 'root'
})
export class ClientesService {
  private readonly apiUrl = 'https://localhost:7000/api/Clientes';

  constructor(private http: HttpClient) {}

  listarClientes(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  cadastrarCliente(cliente: ClienteCadastro): Observable<any> {
    return this.http.post<any>(this.apiUrl, cliente);
  }
}
