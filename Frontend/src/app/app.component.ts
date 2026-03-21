import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';

interface Supplier {
  id: number;
  name: string;
  email?: string | null;
  phone?: string | null;
}

interface Product {
  id: number;
  sku: string;
  name: string;
  description?: string | null;
  unitPrice?: number | null;
  supplier?: Supplier | null;
}

interface InventoryItem {
  id: number;
  product: Product;
  quantity: number;
}

interface PurchaseOrderItem {
  id: number;
  product: Product;
  quantity: number;
  unitPrice?: number | null;
  receivedQuantity: number;
}

interface PurchaseOrder {
  id: number;
  orderNumber: string;
  supplier: Supplier;
  orderDate?: string | null;
  expectedDate?: string | null;
  receivedDate?: string | null;
  status: 'DRAFT' | 'SUBMITTED' | 'PARTIALLY_RECEIVED' | 'RECEIVED' | 'CANCELLED';
  items: PurchaseOrderItem[];
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CurrencyPipe, DatePipe],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  private readonly http = inject(HttpClient);
  private readonly fb = inject(FormBuilder);
  private readonly apiBase = '/api';

  readonly loading = signal(true);
  readonly syncing = signal(false);
  readonly errorMessage = signal('');
  readonly successMessage = signal('');
  readonly healthStatus = signal<'UP' | 'DOWN' | 'UNKNOWN'>('UNKNOWN');
  readonly lastUpdated = signal<Date | null>(null);

  readonly suppliers = signal<Supplier[]>([]);
  readonly products = signal<Product[]>([]);
  readonly inventory = signal<InventoryItem[]>([]);
  readonly purchaseOrders = signal<PurchaseOrder[]>([]);

  readonly supplierForm = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(150)]],
    email: ['', Validators.email],
    phone: [''],
  });

  readonly productForm = this.fb.nonNullable.group({
    sku: ['', [Validators.required, Validators.maxLength(100)]],
    name: ['', [Validators.required, Validators.maxLength(200)]],
    description: [''],
    unitPrice: [0, [Validators.required, Validators.min(0)]],
    supplierId: [0],
  });

  readonly purchaseOrderForm = this.fb.nonNullable.group({
    orderNumber: ['', [Validators.required, Validators.maxLength(50)]],
    supplierId: [0, [Validators.min(1)]],
    expectedDate: [''],
  });

  readonly purchaseOrderItemForm = this.fb.nonNullable.group({
    purchaseOrderId: [0, [Validators.min(1)]],
    productId: [0, [Validators.min(1)]],
    quantity: [1, [Validators.required, Validators.min(1)]],
    unitPrice: [0, [Validators.required, Validators.min(0)]],
  });

  readonly metrics = computed(() => {
    const inventory = this.inventory();
    const purchaseOrders = this.purchaseOrders();
    return {
      suppliers: this.suppliers().length,
      products: this.products().length,
      stockUnits: inventory.reduce((sum, item) => sum + item.quantity, 0),
      lowStock: inventory.filter((item) => item.quantity < 15).length,
      activeOrders: purchaseOrders.filter((order) => order.status !== 'RECEIVED').length,
    };
  });

  readonly featuredOrders = computed(() =>
    [...this.purchaseOrders()]
      .sort((left, right) => right.id - left.id)
      .slice(0, 5),
  );

  readonly lowStockItems = computed(() =>
    this.inventory()
      .filter((item) => item.quantity < 15)
      .sort((left, right) => left.quantity - right.quantity),
  );

  constructor() {
    void this.refreshDashboard();
  }

  async refreshDashboard(): Promise<void> {
    this.loading.set(true);
    this.clearMessages();

    try {
      const [health, suppliers, products, inventory, purchaseOrders] = await Promise.all([
        firstValueFrom(this.http.get<{ status?: string }>(`${this.apiBase}/health`)),
        firstValueFrom(this.http.get<Supplier[]>(`${this.apiBase}/suppliers`)),
        firstValueFrom(this.http.get<Product[]>(`${this.apiBase}/products`)),
        firstValueFrom(this.http.get<InventoryItem[]>(`${this.apiBase}/inventory`)),
        firstValueFrom(this.http.get<PurchaseOrder[]>(`${this.apiBase}/purchase-orders`)),
      ]);

      this.healthStatus.set(health.status === 'UP' ? 'UP' : 'UNKNOWN');
      this.suppliers.set(suppliers);
      this.products.set(products);
      this.inventory.set(inventory);
      this.purchaseOrders.set(purchaseOrders);
      this.lastUpdated.set(new Date());

      this.syncPurchaseOrderDefaults();
    } catch (error) {
      console.error(error);
      this.healthStatus.set('DOWN');
      this.errorMessage.set('Unable to load data from the backend. Start the Spring Boot app on port 8080 and refresh.');
    } finally {
      this.loading.set(false);
    }
  }

  async createSupplier(): Promise<void> {
    if (this.supplierForm.invalid) {
      this.supplierForm.markAllAsTouched();
      return;
    }

    await this.runMutation(async () => {
      const value = this.supplierForm.getRawValue();
      await firstValueFrom(this.http.post(`${this.apiBase}/suppliers`, value));
      this.supplierForm.reset({ name: '', email: '', phone: '' });
      await this.refreshDashboard();
      this.successMessage.set('Supplier created.');
    });
  }

  async createProduct(): Promise<void> {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }

    await this.runMutation(async () => {
      const value = this.productForm.getRawValue();
      const payload = {
        sku: value.sku,
        name: value.name,
        description: value.description,
        unitPrice: value.unitPrice,
        supplier: value.supplierId > 0 ? { id: value.supplierId } : null,
      };
      await firstValueFrom(this.http.post(`${this.apiBase}/products`, payload));
      this.productForm.reset({
        sku: '',
        name: '',
        description: '',
        unitPrice: 0,
        supplierId: this.suppliers()[0]?.id ?? 0,
      });
      await this.refreshDashboard();
      this.successMessage.set('Product created.');
    });
  }

  async createPurchaseOrder(): Promise<void> {
    if (this.purchaseOrderForm.invalid) {
      this.purchaseOrderForm.markAllAsTouched();
      return;
    }

    await this.runMutation(async () => {
      const value = this.purchaseOrderForm.getRawValue();
      await firstValueFrom(
        this.http.post(`${this.apiBase}/purchase-orders/draft`, {
          orderNumber: value.orderNumber,
          supplierId: value.supplierId,
          expectedDate: value.expectedDate || null,
        }),
      );
      this.purchaseOrderForm.reset({
        orderNumber: '',
        supplierId: this.suppliers()[0]?.id ?? 0,
        expectedDate: '',
      });
      await this.refreshDashboard();
      this.successMessage.set('Draft purchase order created.');
    });
  }

  async addPurchaseOrderItem(): Promise<void> {
    if (this.purchaseOrderItemForm.invalid) {
      this.purchaseOrderItemForm.markAllAsTouched();
      return;
    }

    await this.runMutation(async () => {
      const value = this.purchaseOrderItemForm.getRawValue();
      await firstValueFrom(
        this.http.post(`${this.apiBase}/purchase-orders/${value.purchaseOrderId}/items`, {
          productId: value.productId,
          quantity: value.quantity,
          unitPrice: value.unitPrice,
        }),
      );
      await this.refreshDashboard();
      this.successMessage.set('Item added to purchase order.');
    });
  }

  async submitPurchaseOrder(id: number): Promise<void> {
    await this.runMutation(async () => {
      await firstValueFrom(this.http.post(`${this.apiBase}/purchase-orders/${id}/submit`, {}));
      await this.refreshDashboard();
      this.successMessage.set(`Purchase order #${id} submitted.`);
    });
  }

  async receivePurchaseOrder(id: number): Promise<void> {
    await this.runMutation(async () => {
      await firstValueFrom(this.http.post(`${this.apiBase}/purchase-orders/${id}/receive`, {}));
      await this.refreshDashboard();
      this.successMessage.set(`Purchase order #${id} received into inventory.`);
    });
  }

  formatStatus(status: PurchaseOrder['status']): string {
    return status.replaceAll('_', ' ');
  }

  canSubmit(order: PurchaseOrder): boolean {
    return order.status === 'DRAFT' && order.items.length > 0;
  }

  canReceive(order: PurchaseOrder): boolean {
    return (order.status === 'SUBMITTED' || order.status === 'PARTIALLY_RECEIVED') && order.items.length > 0;
  }

  inventoryQuantity(productId: number): number {
    return this.inventory().find((item) => item.product.id === productId)?.quantity ?? 0;
  }

  private async runMutation(action: () => Promise<void>): Promise<void> {
    this.syncing.set(true);
    this.clearMessages();

    try {
      await action();
    } catch (error) {
      console.error(error);
      this.errorMessage.set('The request failed. Check backend logs in STS for the exact validation or persistence error.');
    } finally {
      this.syncing.set(false);
    }
  }

  private syncPurchaseOrderDefaults(): void {
    const firstSupplierId = this.suppliers()[0]?.id ?? 0;
    const firstProductId = this.products()[0]?.id ?? 0;
    const firstDraftOrderId = this.purchaseOrders().find((order) => order.status === 'DRAFT')?.id ?? 0;
    const firstProductPrice = this.products()[0]?.unitPrice ?? 0;

    if (!this.purchaseOrderForm.controls.supplierId.value) {
      this.purchaseOrderForm.controls.supplierId.setValue(firstSupplierId);
    }

    if (!this.productForm.controls.supplierId.value) {
      this.productForm.controls.supplierId.setValue(firstSupplierId);
    }

    if (!this.purchaseOrderItemForm.controls.purchaseOrderId.value) {
      this.purchaseOrderItemForm.controls.purchaseOrderId.setValue(firstDraftOrderId);
    }

    if (!this.purchaseOrderItemForm.controls.productId.value) {
      this.purchaseOrderItemForm.controls.productId.setValue(firstProductId);
    }

    if (!this.purchaseOrderItemForm.controls.unitPrice.value) {
      this.purchaseOrderItemForm.controls.unitPrice.setValue(firstProductPrice);
    }
  }

  private clearMessages(): void {
    this.errorMessage.set('');
    this.successMessage.set('');
  }
}
