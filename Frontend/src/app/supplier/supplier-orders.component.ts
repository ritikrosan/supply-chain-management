import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { SupplierAuthService } from '../services/supplier-auth.service';
import { PurchaseOrder, PurchaseOrderService } from '../services/purchase-order.service';

@Component({
  selector: 'app-supplier-orders',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatCardModule, MatButtonModule],
  templateUrl: './supplier-orders.component.html',
  styleUrls: ['./supplier-orders.component.scss']
})
export class SupplierOrdersComponent implements OnInit {
  displayedColumns = ['orderNumber','status','orderDate','expectedDate','receivedDate','items'];
  pos = signal<PurchaseOrder[]>([]);

  constructor(private auth: SupplierAuthService, private svc: PurchaseOrderService) {}

  ngOnInit(): void {
    const supplierId = this.auth.getSupplierId();
    if (supplierId) {
      this.svc.listBySupplier(supplierId).subscribe(p => this.pos.set(p));
    }
  }

  logout(){ this.auth.logout(); }
}
