import { Routes } from '@angular/router';
import { ProductsComponent } from './features/products/products.component';
import { SuppliersComponent } from './features/suppliers/suppliers.component';
import { PurchaseOrdersComponent } from './features/purchase-orders/purchase-orders.component';
import { InventoryComponent } from './features/inventory/inventory.component';
import { LoginComponent } from './login/login.component';
import { authGuard } from './services/auth.guard';
import { SupplierLoginComponent } from './supplier/supplier-login.component';
import { SupplierOrdersComponent } from './supplier/supplier-orders.component';
import { supplierAuthGuard } from './services/supplier-auth.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: 'login', component: LoginComponent },
  { path: 'supplier/login', component: SupplierLoginComponent },
  { path: 'supplier/orders', component: SupplierOrdersComponent, canActivate: [supplierAuthGuard] },
  { path: 'products', component: ProductsComponent, canActivate: [authGuard] },
  { path: 'suppliers', component: SuppliersComponent, canActivate: [authGuard] },
  { path: 'purchase-orders', component: PurchaseOrdersComponent, canActivate: [authGuard] },
  { path: 'inventory', component: InventoryComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: 'products' }
];
