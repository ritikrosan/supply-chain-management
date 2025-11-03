import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Supplier {
  id?: number;
  name: string;
  email?: string;
  phone?: string;
}

@Injectable({ providedIn: 'root' })
export class SupplierService {
  private base = `${environment.apiUrl}/api/suppliers`;
  constructor(private http: HttpClient) {}

  list(): Observable<Supplier[]> { return this.http.get<Supplier[]>(this.base); }
  create(s: Supplier): Observable<Supplier> { return this.http.post<Supplier>(this.base, s); }
  update(id: number, s: Supplier): Observable<Supplier> { return this.http.put<Supplier>(`${this.base}/${id}`, s); }
  delete(id: number): Observable<void> { return this.http.delete<void>(`${this.base}/${id}`); }
}
