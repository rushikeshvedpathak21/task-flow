import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
<div class="min-vh-100 d-flex">

  <!-- Left branding panel -->
  <div class="d-none d-md-flex flex-column justify-content-center p-5 text-white" style="width:42%;background:#1E3A5F;position:relative;overflow:hidden;">
    <div style="position:absolute;bottom:-60px;right:-60px;width:200px;height:200px;background:rgba(255,255,255,0.05);border-radius:50%"></div>
    <div style="position:relative">
      <h1 class="fw-black mb-2" style="font-size:2rem;letter-spacing:-0.02em">TaskFlow</h1>
      <p class="mb-4" style="color:#93C5FD;font-size:.9rem">Manage your tasks. Stay on top of deadlines.</p>
      <div *ngFor="let item of features" class="d-flex align-items-center gap-2 mb-3">
        <div style="width:8px;height:8px;border-radius:50%;background:#2563EB;flex-shrink:0"></div>
        <span style="font-size:.85rem;color:#CBD5E1">{{item}}</span>
      </div>
    </div>
  </div>

  <!-- Right login card -->
  <div class="flex-fill d-flex align-items-center justify-content-center p-4" style="background:#F4F6FA">
    <div class="bg-white rounded-3 p-4 shadow" style="width:100%;max-width:420px">
      <div class="text-center mb-4">
        <h2 class="fw-bold" style="color:#1E293B">Welcome Back</h2>
        <p class="text-muted small">Sign in to your account</p>
      </div>

      <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
        <div class="mb-3">
          <label class="form-label fw-semibold small text-uppercase text-muted" style="letter-spacing:.06em">Email Address</label>
          <input type="email" class="form-control" formControlName="email" placeholder="you@example.com"
            [class.is-invalid]="submitted && f['email'].errors">
          <div class="invalid-feedback" *ngIf="submitted && f['email'].errors?.['required']">Email is required.</div>
          <div class="invalid-feedback" *ngIf="submitted && f['email'].errors?.['email']">Please enter a valid email.</div>
        </div>

        <div class="mb-2">
          <label class="form-label fw-semibold small text-uppercase text-muted" style="letter-spacing:.06em">Password</label>
          <div class="position-relative">
            <input [type]="showPassword ? 'text' : 'password'" class="form-control pe-5" formControlName="password" placeholder="Enter your password"
              [class.is-invalid]="submitted && f['password'].errors">
            <button type="button" class="btn btn-link position-absolute top-50 end-0 translate-middle-y pe-3" (click)="showPassword=!showPassword" style="text-decoration:none">
              <i [class]="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'" style="color:#94A3B8"></i>
            </button>
            <div class="invalid-feedback">Password is required.</div>
          </div>
        </div>

        <div class="text-end mb-3">
          <a href="#" class="small text-primary text-decoration-none">Forgot your password?</a>
        </div>

        <div *ngIf="errorMessage" class="alert alert-danger py-2 small mb-3">{{errorMessage}}</div>

        <button type="submit" class="btn btn-primary w-100 fw-bold py-2" style="background:#2563EB;border-color:#2563EB">Sign In</button>
      </form>

      <div class="text-center mt-3 small text-muted">
        Don't have an account?
        <a routerLink="/register" class="text-primary fw-semibold text-decoration-none"> Register here</a>
      </div>
    </div>
  </div>
</div>
  `
})
export class LoginComponent {
  loginForm: FormGroup;
  submitted = false;
  showPassword = false;
  errorMessage = '';

  features = ['Create & organise tasks easily', 'Track progress in real-time', 'Collaborate with your team'];

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {
    this.loginForm = this.fb.group({
      email:    ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
    });
  }

  get f() { return this.loginForm.controls; }

  onSubmit(): void {
    this.submitted = true;
    this.errorMessage = '';
    if (this.loginForm.invalid) return;

    this.auth.login(this.f['email'].value, this.f['password'].value).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err) => {
        this.errorMessage = err.error?.error || 'Invalid email or password. Please try again.';
      }
    });
  }
}
