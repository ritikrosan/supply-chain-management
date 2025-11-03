import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { InventoryRow, InventoryService } from '../../services/inventory.service';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatCardModule],
  templateUrl: './inventory.component.html',
  styleUrl: './inventory.component.scss'
})
export class InventoryComponent implements OnInit {
  private svc = inject(InventoryService);

  displayedColumns = ['id','sku','name','quantity'];
  rows = signal<InventoryRow[]>([]);

  ngOnInit(): void {
    this.svc.list().subscribe(r => this.rows.set(r));
  }
}
