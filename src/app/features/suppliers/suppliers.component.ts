import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Supplier, SupplierService } from '../../services/supplier.service';

@Component({
  selector: 'app-suppliers',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule
  ],
  templateUrl: './suppliers.component.html',
  styleUrl: './suppliers.component.scss'
})
export class SuppliersComponent implements OnInit {
  private fb = inject(FormBuilder);
  private svc = inject(SupplierService);
  private snack = inject(MatSnackBar);

  displayedColumns = ['id','name','email','phone','actions'];
  suppliers = signal<Supplier[]>([]);
  search = signal<string>('');
  filteredSuppliers = computed(() => {
    const q = this.search().trim().toLowerCase();
    if (!q) return this.suppliers();
    return this.suppliers().filter(s =>
      (s.name?.toLowerCase().includes(q)) ||
      (s.email?.toLowerCase().includes(q)) ||
      (s.phone?.toLowerCase().includes(q))
    );
  });

  form = this.fb.nonNullable.group({
    id: this.fb.control<number | null>(null),
    name: ['', Validators.required],
    email: [''],
    phone: ['']
  });

  ngOnInit(): void { this.load(); }

  load() { this.svc.list().subscribe(s => this.suppliers.set(s)); }

  edit(s: Supplier) {
    this.form.patchValue({ id: s.id ?? null, name: s.name, email: s.email ?? '', phone: s.phone ?? '' });
  }

  reset() { this.form.reset(); }

  save() {
    const v = this.form.getRawValue();
    const body: Supplier = { id: v.id ?? undefined, name: v.name!, email: v.email || undefined, phone: v.phone || undefined };
    const obs = body.id ? this.svc.update(body.id, body) : this.svc.create(body);
    obs.subscribe({
      next: () => { this.snack.open('Saved', 'OK', { duration: 1500 }); this.reset(); this.load(); },
      error: () => this.snack.open('Save failed', 'Dismiss', { duration: 2500 })
    });
  }

  remove(s: Supplier) {
    if (!s.id) return;
    this.svc.delete(s.id).subscribe({
      next: () => { this.snack.open('Deleted', 'OK', { duration: 1500 }); this.load(); },
      error: () => this.snack.open('Delete failed', 'Dismiss', { duration: 2500 })
    });
  }
}
