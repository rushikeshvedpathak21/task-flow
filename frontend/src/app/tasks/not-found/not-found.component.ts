import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
<div class="min-vh-100 d-flex flex-column align-items-center justify-content-center text-center p-4"
  style="background:#F4F6FA">
  <div class="fw-black mb-0" style="font-size:7rem;color:#CBD5E1;line-height:1">
    4<span style="color:#94A3B8">0</span>4
  </div>
  <h2 class="fw-bold mt-2 mb-1" style="color:#1E293B">Oops! Page not found.</h2>
  <p class="text-muted mb-4">The page you're looking for doesn't exist or has been moved.</p>

  <div class="d-flex gap-3 mb-3">
    <button class="btn btn-primary fw-bold" style="background:#2563EB;border-color:#2563EB" (click)="goDashboard()">
      Go to Dashboard
    </button>
    <a routerLink="/login" class="btn btn-outline-secondary fw-semibold">Back to Login</a>
  </div>

  <div class="small text-muted">
    Or try:
    <span class="text-primary ms-2 me-2" style="cursor:pointer" (click)="goDashboard()">Dashboard</span>
    <a routerLink="/login" class="text-primary text-decoration-none me-2">Login</a>
    <a routerLink="/register" class="text-primary text-decoration-none">Register</a>
  </div>
</div>
  `
})
export class NotFoundComponent {
  constructor(private auth: AuthService, private router: Router) {}

  goDashboard(): void {
    // Angular Router wildcard — use Router.navigate(), never href
    this.auth.isLoggedIn()
      ? this.router.navigate(['/dashboard'])
      : this.router.navigate(['/login']);
  }
}
