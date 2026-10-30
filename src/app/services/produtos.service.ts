import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProdutosService {
  private apiUrl = 'https://localhost:7000/api/itens';

  constructor(private http: HttpClient) {}

  getItens(tipo?: string, idcategoria?: number): Observable<any[]> {
    let url = this.apiUrl;
    const params: string[] = [];
    if (tipo) params.push(`tipo=${tipo}`);
    if (idcategoria) params.push(`idcategoria=${idcategoria}`);
    if (params.length > 0) url += '?' + params.join('&');

    return this.http.get<any[]>(url);
  }

  getItemById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }
}