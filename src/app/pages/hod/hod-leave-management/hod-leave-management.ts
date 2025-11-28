import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HodDataService } from '../../../services/hod.service';

@Component({
  selector: 'app-hod-leave-management',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hod-leave-management.html',
  styleUrls: ['./hod-leave-management.scss']
})
export class HodLeaveManagement {

  department = 'IT';  // TEMP until login is integrated
  leaves: any[] = [];

  constructor(private hodData: HodDataService) {}

 ngOnInit() {
  this.hodData.init().subscribe(() => {
    this.loadLeaves();
  });
}


loadLeaves() {
  const allStaff = this.hodData.getStaff();
  const deptStaff = this.hodData.getStaffByDepartment(this.department);
  const allLeaves = this.hodData.getLeaves();

  // console.log("All Staff:", allStaff);
  // console.log("Dept Staff:", deptStaff);
  console.log("All Leaves:", allLeaves);

  this.leaves = this.hodData.getLeavesByDepartment(this.department);
}


  approve(id: number) {
    this.hodData.updateLeaveStatus(id, 'APPROVED');
    this.loadLeaves(); // refresh table
  }

  reject(id: number) {
    this.hodData.updateLeaveStatus(id, 'REJECTED');
    this.loadLeaves(); // refresh table
  }

  viewDetails(l: any) {
    alert(
      `Leave Details:\n\n` +
      `From: ${l.fromDate}\nTo: ${l.toDate}\nReason: ${l.reason}\nStatus: ${l.status}`
    );
  }
}
