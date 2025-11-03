import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly KEY = 'scm_auth';
  // simple auth state
  public readonly isLoggedIn = signal<boolean>(false);

  constructor(private router: Router) {
    const saved = localStorage.getItem(this.KEY);
    this.isLoggedIn.set(saved === 'true');
  }

  login(username: string, password: string): boolean {
    const ok = username === 'supply@123' && password === 'supply@99';
    this.isLoggedIn.set(ok);
    localStorage.setItem(this.KEY, ok ? 'true' : 'false');
    return ok;
  }

  logout() {
    this.isLoggedIn.set(false);
    localStorage.removeItem(this.KEY);
    this.router.navigateByUrl('/login');
  }
}
