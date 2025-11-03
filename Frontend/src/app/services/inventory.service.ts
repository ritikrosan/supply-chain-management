import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface InventoryRow {
  id: number;
  quantity: number;
  product: { id: number; sku?: string; name?: string };
}

@Injectable({ providedIn: 'root' })
export class InventoryService {
  private base = `${environment.apiUrl}/api/inventory`;
  constructor(private http: HttpClient) {}

  list(): Observable<InventoryRow[]> { return this.http.get<InventoryRow[]>(this.base); }
}
