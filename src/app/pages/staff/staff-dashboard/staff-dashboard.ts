import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HodDataService } from '../../../services/hod.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-staff-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './staff-dashboard.html',
  styleUrls: ['./staff-dashboard.scss']
})
export class StaffDashboard implements OnInit {
  total = 0;
  approved = 0;
  rejected = 0;
  staffId = 0;

  constructor(private hodData: HodDataService, private auth: AuthService) {}

  ngOnInit() {
    const user = this.auth.getCurrentUserSync();
    if (!user) return;
    this.staffId = user.id;
    this.refresh();
  }

  refresh() {
    const leaves = this.hodData.listLeavesByStaff(this.staffId);
    this.total = leaves.length;
    this.approved = leaves.filter(l => l.status === 'APPROVED').length;
    this.rejected = leaves.filter(l => l.status === 'REJECTED').length;
  }
}
