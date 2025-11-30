import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },

  {
    path: 'auth',
    loadChildren: () =>
      import('./pages/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },

  {
    path: 'hod',
    canActivate: [AuthGuard],
    data: { roles: ['HOD'] },
    loadChildren: () =>
      import('./pages/hod/hod.routes').then(m => m.HOD_ROUTES)
  },

  {
    path: 'staff',
    canActivate: [AuthGuard],
    data: { roles: ['STAFF'] },
    loadChildren: () =>
      import('./pages/staff/staff.routes').then(m => m.STAFF_ROUTES)
  },

  { path: '**', redirectTo: 'auth/login' }
];
