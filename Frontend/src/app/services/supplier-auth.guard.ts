import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { inject } from '@angular/core';
import { SupplierAuthService } from './supplier-auth.service';

export const supplierAuthGuard: CanActivateFn = () => {
  const auth = inject(SupplierAuthService);
  const router = inject(Router);
  if (auth.isLoggedIn()) {
    return true;
  }
  return router.parseUrl('/supplier/login') as UrlTree;
};
