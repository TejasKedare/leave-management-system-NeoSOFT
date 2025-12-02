import { Component } from '@angular/core';
import { HodDataService } from '../../../services/hod.service';

@Component({
  selector: 'app-hod-dashboard',
  imports: [],
  templateUrl: './hod-dashboard.html',
  styleUrl: './hod-dashboard.scss',
})
export class HodDashboard {

  staffCount = 0;
  leaveCount = 0;

  department = 'IT';

  constructor(private hodData: HodDataService) {}

  ngOnInit() {
    const staff = this.hodData.getStaff();
    const leaves = this.hodData.getLeaves();

    this.staffCount = staff.filter(s => s.department === this.department).length;
    this.leaveCount = leaves.length;
  }
}
