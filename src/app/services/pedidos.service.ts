import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PedidosService {
  private apiUrl = 'https://localhost:7000/api/Atendimentos';

  constructor(private http: HttpClient) {}

  getPedidos(status?: string): Observable<any[]> {
    const url = status ? `${this.apiUrl}?status=${status}` : this.apiUrl;
    return this.http.get<any[]>(url);
  }

  criarPedido(pedidoDto: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, pedidoDto);
  }
}