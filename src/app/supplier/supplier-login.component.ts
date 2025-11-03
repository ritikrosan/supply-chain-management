import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { SupplierAuthService } from '../services/supplier-auth.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-supplier-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatSnackBarModule],
  templateUrl: './supplier-login.component.html',
  styleUrls: ['./supplier-login.component.scss']
})
export class SupplierLoginComponent {
  form!: FormGroup;
  error = '';

  constructor(private fb: FormBuilder, private auth: SupplierAuthService, private router: Router, private snack: MatSnackBar) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required]],
    });
  }

  submit(){
    this.error = '';
    if(this.form.invalid){ this.form.markAllAsTouched(); return; }
    const { email, phone } = this.form.value as { email: string; phone: string };
    this.auth.login(email, phone).subscribe({
      next: (s) => { this.auth.setSession(s); this.router.navigateByUrl('/supplier/orders'); },
      error: () => { this.error = 'Invalid supplier credentials'; this.snack.open('Invalid supplier credentials', 'Dismiss', { duration: 2500 }); }
    });
  }
}
