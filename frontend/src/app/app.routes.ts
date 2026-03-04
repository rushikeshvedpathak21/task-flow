import { Routes } from '@angular/router';
import { AuthGuard, GuestGuard } from './guards/guards';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./auth/login/login.component').then(m => m.LoginComponent),
    canActivate: [GuestGuard]
  },
  {
    path: 'register',
    loadComponent: () => import('./auth/register/register.component').then(m => m.RegisterComponent),
    canActivate: [GuestGuard]
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./tasks/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [AuthGuard]
  },
  {
    path: '**',
    loadComponent: () => import('./tasks/not-found/not-found.component').then(m => m.NotFoundComponent)
  }
];
