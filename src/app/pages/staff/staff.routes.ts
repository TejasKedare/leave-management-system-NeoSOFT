import { Routes } from '@angular/router';
import { StaffLayout } from './staff-layout/staff-layout';
import { StaffDashboard } from './staff-dashboard/staff-dashboard';
import { StaffLeaves } from './staff-leaves/staff-leaves';


export const STAFF_ROUTES: Routes = [
  {
    path: '',
    component: StaffLayout,
    children: [
      { path: 'dashboard', component: StaffDashboard },
      { path: 'leaves', component: StaffLeaves },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  }
];
