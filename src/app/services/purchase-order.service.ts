import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface PurchaseOrderItemInput { productId: number; quantity: number; unitPrice?: number | null; }
export interface PurchaseOrder {
  id: number;
  orderNumber: string;
  supplier: { id: number; name?: string };
  orderDate: string;
  expectedDate?: string | null;
  receivedDate?: string | null;
  status: 'DRAFT'|'SUBMITTED'|'PARTIALLY_RECEIVED'|'RECEIVED'|'CANCELLED';
  items: Array<{ id: number; product: { id:number; name?: string }; quantity: number; receivedQuantity: number; unitPrice?: number|null }>;
}

@Injectable({ providedIn: 'root' })
export class PurchaseOrderService {
  private base = `${environment.apiUrl}/api/purchase-orders`;
  constructor(private http: HttpClient) {}

  list(): Observable<PurchaseOrder[]> { return this.http.get<PurchaseOrder[]>(this.base); }
  listBySupplier(supplierId: number): Observable<PurchaseOrder[]> { return this.http.get<PurchaseOrder[]>(`${this.base}/by-supplier`, { params: { supplierId } as any }); }
  get(id: number): Observable<PurchaseOrder> { return this.http.get<PurchaseOrder>(`${this.base}/${id}`); }
  createDraft(orderNumber: string, supplierId: number, expectedDate?: string | null): Observable<PurchaseOrder> {
    return this.http.post<PurchaseOrder>(`${this.base}/draft`, { orderNumber, supplierId, expectedDate });
  }
  addItem(poId: number, item: PurchaseOrderItemInput): Observable<PurchaseOrder> {
    return this.http.post<PurchaseOrder>(`${this.base}/${poId}/items`, item as any);
  }
  submit(poId: number): Observable<PurchaseOrder> { return this.http.post<PurchaseOrder>(`${this.base}/${poId}/submit`, {}); }
  receive(poId: number): Observable<PurchaseOrder> { return this.http.post<PurchaseOrder>(`${this.base}/${poId}/receive`, {}); }
}
