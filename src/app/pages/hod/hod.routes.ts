import { Routes } from '@angular/router';
import { HodLayout } from './hod-layout/hod-layout';
import { HodDashboard } from './hod-dashboard/hod-dashboard';
import { StaffManagement } from './staff-management/staff-management';
import { HodLeaveManagement } from './hod-leave-management/hod-leave-management';


export const HOD_ROUTES: Routes = [
  {
    path: '',
    component: HodLayout,
    children: [
      {
        path: 'dashboard',
        component: HodDashboard
      },
      {
        path: 'staff',
        component: StaffManagement
      },
      {
        path: 'leaves',
        component: HodLeaveManagement
      }
    ]
  }
];
