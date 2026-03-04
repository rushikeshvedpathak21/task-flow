import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  template: `
<nav class="navbar navbar-dark px-4 nav-bg" style="height:52px;background:#1E3A5F">
  <div class="d-flex align-items-center gap-2">
    <div style="width:10px;height:10px;border-radius:50%;background:#2563EB"></div>
    <span class="fw-black" style="font-size:1.1rem;letter-spacing:-0.01em;color:#fff">TaskFlow</span>
  </div>
  <div class="d-flex align-items-center gap-3">
    <span class="small" style="color:#93C5FD">Hello, {{ ((auth.currentUser$ | async)?.fullName ?? '') | slice:0 }}</span>
    <button class="btn btn-sm" (click)="auth.logout()"
      style="background:rgba(255,255,255,0.12);color:#fff;border:1px solid rgba(255,255,255,0.2);font-size:.8rem">
      <i class="bi bi-box-arrow-right me-1"></i>Logout
    </button>
  </div>
</nav>
  `
})
export class NavbarComponent {
  constructor(public auth: AuthService) {}
}
