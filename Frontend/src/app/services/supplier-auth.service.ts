import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

export interface SupplierSession {
  id: number;
  name?: string;
  email?: string;
  phone?: string;
}

@Injectable({ providedIn: 'root' })
export class SupplierAuthService {
  private readonly KEY = 'scm_supplier_auth';
  private readonly base = `${environment.apiUrl}/api/suppliers`;

  public readonly isLoggedIn = signal<boolean>(false);
  public readonly supplier = signal<SupplierSession | null>(null);

  constructor(private http: HttpClient, private router: Router) {
    const saved = localStorage.getItem(this.KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as SupplierSession;
        if (parsed?.id) {
          this.supplier.set(parsed);
          this.isLoggedIn.set(true);
        }
      } catch {}
    }
  }

  login(email: string, phone: string) {
    return this.http.post<SupplierSession>(`${this.base}/auth`, { email, phone });
  }

  setSession(s: SupplierSession) {
    this.supplier.set(s);
    this.isLoggedIn.set(true);
    localStorage.setItem(this.KEY, JSON.stringify(s));
  }

  logout() {
    this.supplier.set(null);
    this.isLoggedIn.set(false);
    localStorage.removeItem(this.KEY);
    this.router.navigateByUrl('/supplier/login');
  }

  getSupplierId(): number | null { return this.supplier()?.id ?? null; }
}
