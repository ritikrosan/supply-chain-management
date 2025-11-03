import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { PurchaseOrder, PurchaseOrderService } from '../../services/purchase-order.service';
import { Supplier, SupplierService } from '../../services/supplier.service';
import { Product, ProductService } from '../../services/product.service';

@Component({
  selector: 'app-purchase-orders',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatSnackBarModule
  ],
  templateUrl: './purchase-orders.component.html',
  styleUrls: ['./purchase-orders.component.scss']
})
export class PurchaseOrdersComponent implements OnInit {
  private fb = inject(FormBuilder);
  private svc = inject(PurchaseOrderService);
  private supplierSvc = inject(SupplierService);
  private productSvc = inject(ProductService);
  private snack = inject(MatSnackBar);

  displayedColumns = ['id','orderNumber','supplier','status','orderDate','expectedDate','receivedDate','items','actions'];
  pos = signal<PurchaseOrder[]>([]);
  suppliers = signal<Supplier[]>([]);
  products = signal<Product[]>([]);

  draftForm = this.fb.nonNullable.group({
    orderNumber: ['', Validators.required],
    supplierId: this.fb.control<number | null>(null, { validators: Validators.required }),
    expectedDate: ['']
  });

  itemForm = this.fb.nonNullable.group({
    poId: this.fb.control<number | null>(null, { validators: Validators.required }),
    productId: this.fb.control<number | null>(null, { validators: Validators.required }),
    quantity: this.fb.control<number>(1, { validators: Validators.required }),
    unitPrice: this.fb.control<number | null>(null)
  });

  selectedPO = computed(() => {
    const id = this.itemForm.value.poId;
    return this.pos().find(p => p.id === id);
  });

  ngOnInit(): void {
    this.load();
    this.supplierSvc.list().subscribe(s => this.suppliers.set(s));
    this.productSvc.list().subscribe(p => this.products.set(p));
  }

  load() { this.svc.list().subscribe(p => this.pos.set(p)); }

  createDraft() {
    const v = this.draftForm.getRawValue();
    this.svc.createDraft(v.orderNumber!, v.supplierId!, v.expectedDate || null).subscribe({
      next: () => { this.snack.open('Draft created', 'OK', { duration: 1500 }); this.draftForm.reset(); this.load(); },
      error: () => this.snack.open('Failed to create draft', 'Dismiss', { duration: 2500 })
    });
  }

  addItem() {
    const v = this.itemForm.getRawValue();
    if (!v.poId || !v.productId || !v.quantity) return;
    this.svc.addItem(v.poId, { productId: v.productId, quantity: v.quantity, unitPrice: v.unitPrice }).subscribe({
      next: () => { this.snack.open('Item added', 'OK', { duration: 1500 }); this.load(); },
      error: () => this.snack.open('Failed to add item', 'Dismiss', { duration: 2500 })
    });
  }

  submit(po: PurchaseOrder) {
    this.svc.submit(po.id).subscribe({
      next: () => { this.snack.open('Submitted', 'OK', { duration: 1500 }); this.load(); },
      error: () => this.snack.open('Failed to submit', 'Dismiss', { duration: 2500 })
    });
  }

  receive(po: PurchaseOrder) {
    this.svc.receive(po.id).subscribe({
      next: () => { this.snack.open('Received', 'OK', { duration: 1500 }); this.load(); },
      error: () => this.snack.open('Failed to receive', 'Dismiss', { duration: 2500 })
    });
  }
}
