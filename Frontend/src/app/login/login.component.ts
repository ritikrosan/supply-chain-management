import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatCardModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  form!: FormGroup;
  error = '';

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {
    this.form = this.fb.group({
      agentName: ['', [Validators.required]],
      password: ['', [Validators.required]],
    });
  }

  submit(){
    this.error = '';
    if(this.form.invalid){
      this.form.markAllAsTouched();
      return;
    }
    const { agentName: username, password } = this.form.value as {agentName:string; password:string};
    const ok = this.auth.login(username, password);
    if(ok){
      this.router.navigateByUrl('/products');
    } else {
      this.error = 'Invalid credentials';
    }
  }
}
