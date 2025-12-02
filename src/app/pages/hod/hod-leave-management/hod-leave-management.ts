import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HodDataService } from '../../../services/hod.service';
import { DateFormatPipe } from '../../../pipes/date-format-pipe';

declare var bootstrap: any;

@Component({
  selector: 'app-hod-leave-management',
  standalone: true,
  imports: [CommonModule, DateFormatPipe],
  providers: [DateFormatPipe],
  templateUrl: './hod-leave-management.html',
  styleUrls: ['./hod-leave-management.scss']
})
export class HodLeaveManagement {
  department = 'IT';
  leaves: any[] = [];

  modalTitle = '';
  modalMessage = '';
  modalAction: (() => void) | null = null;

  constructor(
    private hodData: HodDataService,
    private dateFormat: DateFormatPipe
  ) {}

  ngOnInit() {
    this.loadLeaves();
  }

  loadLeaves() {
    this.leaves = this.hodData.getLeavesByDepartment(this.department);
  }

  openModal(title: string, message: string, action: () => void) {
    this.modalTitle = title;
    this.modalMessage = message;
    this.modalAction = action;

    const modalEl = document.getElementById('actionModal');
    const modal = new bootstrap.Modal(modalEl!);
    modal.show();
  }

  modalCancel() {
    const modalEl = document.getElementById('actionModal');
    const modal = bootstrap.Modal.getInstance(modalEl!);
    modal.hide();
  }

  modalConfirm() {
    if (this.modalAction) this.modalAction();

    const modalEl = document.getElementById('actionModal');
    const modal = bootstrap.Modal.getInstance(modalEl!);
    modal.hide();
  }

  approve(id: number, name: string) {
    this.openModal(
      'Approve Leave',
      `Approve leave request for <b>${name}</b>?`,
      () => {
        this.hodData.updateLeaveStatus(id, 'APPROVED');
        this.loadLeaves();
      }
    );
  }

  reject(id: number, name: string) {
    this.openModal(
      'Reject Leave',
      `Reject leave request for <b>${name}</b>?`,
      () => {
        this.hodData.updateLeaveStatus(id, 'REJECTED');
        this.loadLeaves();
      }
    );
  }

  viewDetails(l: any) {
    this.openModal(
      'Leave Details',
      `
        <strong>From:</strong> ${this.dateFormat.transform(l.fromDate)}<br/>
        <strong>To:</strong> ${this.dateFormat.transform(l.toDate)}<br/>
        <strong>Reason:</strong> ${l.reason}<br/>
        <strong>Status:</strong> <span class="badge 
          ${l.status === 'PENDING' ? 'bg-warning' : l.status === 'APPROVED' ? 'bg-success' : 'bg-danger'}">
          ${l.status}
        </span>
      `,
      () => {}
    );
  }
}
