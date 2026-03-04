import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

function passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
  const pw = group.get('password')?.value;
  const confirm = group.get('confirmPassword')?.value;
  return pw === confirm ? null : { passwordMismatch: true };
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
<div class="min-vh-100 d-flex">
  <div class="d-none d-md-flex flex-column justify-content-center p-5 text-white" style="width:38%;background:#1E3A5F">
    <h1 class="fw-black mb-2" style="font-size:1.8rem">TaskFlow</h1>
    <p style="color:#93C5FD;font-size:.9rem">Join thousands of teams building better workflows.</p>
  </div>

  <div class="flex-fill d-flex align-items-center justify-content-center p-4" style="background:#F4F6FA">
    <div class="bg-white rounded-3 p-4 shadow" style="width:100%;max-width:460px">
      <div class="text-center mb-4">
        <h2 class="fw-bold" style="color:#1E293B">Create your Account</h2>
        <p class="text-muted small">It's free and only takes a minute</p>
      </div>

      <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
        <div class="mb-3">
          <label class="form-label fw-semibold small text-uppercase text-muted">Full Name</label>
          <input type="text" class="form-control" formControlName="fullName" placeholder="Alex Johnson"
            [class.is-invalid]="submitted && f['fullName'].errors">
          <div class="invalid-feedback">Full name is required.</div>
        </div>

        <div class="mb-3">
          <label class="form-label fw-semibold small text-uppercase text-muted">Email Address</label>
          <input type="email" class="form-control" formControlName="email" placeholder="you@example.com"
            [class.is-invalid]="submitted && f['email'].errors">
          <div class="invalid-feedback">Please enter a valid email address.</div>
        </div>

        <div class="mb-3">
          <label class="form-label fw-semibold small text-uppercase text-muted">Password</label>
          <input type="password" class="form-control" formControlName="password" placeholder="Min. 8 characters"
            [class.is-invalid]="submitted && f['password'].errors">
          <div class="invalid-feedback">Password must be at least 8 characters.</div>
          <!-- Strength indicator -->
          <div *ngIf="f['password'].value" class="mt-2">
            <div class="d-flex gap-1 mb-1">
              <div *ngFor="let i of [1,2,3,4]" class="flex-fill rounded" style="height:4px"
                [style.background]="i <= passwordStrength ? strengthColor : '#E2E8F0'"></div>
            </div>
            <small [style.color]="strengthColor" class="fw-semibold">Password strength: {{strengthLabel}}</small>
          </div>
        </div>

        <div class="mb-3">
          <label class="form-label fw-semibold small text-uppercase text-muted">Confirm Password</label>
          <input type="password" class="form-control" formControlName="confirmPassword" placeholder="Re-enter password"
            [class.is-invalid]="submitted && (f['confirmPassword'].errors || registerForm.errors?.['passwordMismatch'])">
          <div class="invalid-feedback">Passwords do not match. Please try again.</div>
        </div>

        <div *ngIf="errorMessage" class="alert alert-danger py-2 small mb-3">{{errorMessage}}</div>
        <div *ngIf="successMessage" class="alert alert-success py-2 small mb-3">{{successMessage}}</div>

        <button type="submit" class="btn btn-primary w-100 fw-bold py-2" style="background:#2563EB;border-color:#2563EB">Create Account</button>
      </form>

      <div class="text-center mt-3 small text-muted">
        Already have an account?
        <a routerLink="/login" class="text-primary fw-semibold text-decoration-none"> Sign in here</a>
      </div>
    </div>
  </div>
</div>
  `
})
export class RegisterComponent {
  registerForm: FormGroup;
  submitted = false;
  errorMessage = '';
  successMessage = '';

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {
    this.registerForm = this.fb.group({
      fullName:        ['', Validators.required],
      email:           ['', [Validators.required, Validators.email]],
      password:        ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
    }, { validators: passwordMatchValidator });
  }

  get f() { return this.registerForm.controls; }

  get passwordStrength(): number {
    const pw = this.f['password'].value || '';
    let s = 0;
    if (pw.length >= 8) s++;
    if (/[A-Z]/.test(pw)) s++;
    if (/[0-9]/.test(pw)) s++;
    if (/[^A-Za-z0-9]/.test(pw)) s++;
    return s;
  }

  get strengthColor(): string {
    return ['#E2E8F0','#EF4444','#F59E0B','#22C55E','#15803D'][this.passwordStrength];
  }

  get strengthLabel(): string {
    return ['','Weak','Fair','Good','Strong'][this.passwordStrength];
  }

  onSubmit(): void {
    this.submitted = true;
    this.errorMessage = '';
    if (this.registerForm.invalid) return;

    this.auth.register(this.f['fullName'].value, this.f['email'].value, this.f['password'].value).subscribe({
      next: () => {
        this.successMessage = 'Account created! Redirecting to login...';
        setTimeout(() => this.router.navigate(['/login']), 1500);
      },
      error: (err) => {
        this.errorMessage = err.error?.error || 'Registration failed. Please try again.';
      }
    });
  }
}
