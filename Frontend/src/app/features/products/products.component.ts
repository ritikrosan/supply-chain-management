import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Product, ProductService } from '../../services/product.service';
import { Supplier, SupplierService } from '../../services/supplier.service';

@Component({
  selector: 'app-products',
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
  templateUrl: './products.component.html',
  styleUrl: './products.component.scss'
})
export class ProductsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private productSvc = inject(ProductService);
  private supplierSvc = inject(SupplierService);
  private snack = inject(MatSnackBar);

  displayedColumns = ['id','sku','name','unitPrice','supplier','actions'];
  products = signal<Product[]>([]);
  suppliers = signal<Supplier[]>([]);
  search = signal<string>('');
  filteredProducts = computed(() => {
    const q = this.search().trim().toLowerCase();
    if (!q) return this.products();
    return this.products().filter(p =>
      (p.sku?.toLowerCase().includes(q)) ||
      (p.name?.toLowerCase().includes(q)) ||
      (p.supplier?.name?.toLowerCase().includes(q))
    );
  });

  form = this.fb.nonNullable.group({
    id: this.fb.control<number | null>(null),
    sku: ['', Validators.required],
    name: ['', Validators.required],
    description: [''],
    unitPrice: this.fb.control<number | null>(null),
    supplierId: this.fb.control<number | null>(null)
  });

  ngOnInit(): void {
    this.load();
    this.supplierSvc.list().subscribe(s => this.suppliers.set(s));
  }

  load() {
    this.productSvc.list().subscribe(p => this.products.set(p));
  }

  edit(p: Product) {
    this.form.patchValue({
      id: p.id ?? null,
      sku: p.sku,
      name: p.name,
      description: p.description ?? '',
      unitPrice: p.unitPrice ?? null,
      supplierId: p.supplier?.id ?? null
    });
  }

  reset() { this.form.reset(); }

  save() {
    const v = this.form.getRawValue();
    const body: Product = {
      id: v.id ?? undefined,
      sku: v.sku!,
      name: v.name!,
      description: v.description || undefined,
      unitPrice: v.unitPrice ?? undefined,
      supplier: v.supplierId ? { id: v.supplierId } : null
    };
    const obs = body.id
      ? this.productSvc.update(body.id, body)
      : this.productSvc.create(body);
    obs.subscribe({
      next: () => { this.snack.open('Saved', 'OK', { duration: 1500 }); this.reset(); this.load(); },
      error: () => this.snack.open('Save failed', 'Dismiss', { duration: 2500 })
    });
  }

  remove(p: Product) {
    if (!p.id) return;
    this.productSvc.delete(p.id).subscribe({
      next: () => { this.snack.open('Deleted', 'OK', { duration: 1500 }); this.load(); },
      error: () => this.snack.open('Delete failed', 'Dismiss', { duration: 2500 })
    });
  }
}
