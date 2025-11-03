import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface SupplierRef { id: number; name?: string; }
export interface Product {
  id?: number;
  sku: string;
  name: string;
  description?: string;
  unitPrice?: number;
  supplier?: SupplierRef | null;
}

@Injectable({ providedIn: 'root' })
export class ProductService {
  private base = `${environment.apiUrl}/api/products`;
  constructor(private http: HttpClient) {}

  list(): Observable<Product[]> { return this.http.get<Product[]>(this.base); }
  create(p: Product): Observable<Product> { return this.http.post<Product>(this.base, p); }
  update(id: number, p: Product): Observable<Product> { return this.http.put<Product>(`${this.base}/${id}`, p); }
  delete(id: number): Observable<void> { return this.http.delete<void>(`${this.base}/${id}`); }
}
