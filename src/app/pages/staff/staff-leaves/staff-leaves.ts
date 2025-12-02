import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HodDataService } from '../../../services/hod.service';
import { AuthService } from '../../../services/auth.service';
import { FormBuilder, ReactiveFormsModule, Validators, FormsModule, AbstractControl } from '@angular/forms';

declare var bootstrap: any;

@Component({
  selector: 'app-staff-leaves',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './staff-leaves.html',
  styleUrls: ['./staff-leaves.scss']
})
export class StaffLeaves implements OnInit {
  staffId = 0;
  leaves: any[] = [];
  showApply = false;
  form: any;
  today = new Date().toISOString().split('T')[0];

  // modal state
  modalTitle = '';
  modalMessage = '';

  constructor(
    private hodData: HodDataService,
    private auth: AuthService,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    this.form = this.fb.group({
      fromDate: ['', Validators.required],
      toDate: ['', Validators.required],
      reason: ['', Validators.required]
    });

    this.form.get('fromDate')!.valueChanges.subscribe((from: string) => {
      const toCtrl = this.form.get('toDate')!;
      
      toCtrl.reset();
      toCtrl.disable();

      if (from) {
        toCtrl.enable();
        toCtrl.setValidators([
          Validators.required,
          (control: AbstractControl) => {
            if (!control.value) return null;
            return control.value < from ? { invalidRange: true } : null;
          }
        ]);
        toCtrl.updateValueAndValidity();
      }
    });

    const user = this.auth.getCurrentUserSync();
    if (!user) return;

    this.staffId = user.id;
    this.load();
  }

  load() {
    this.leaves = this.hodData.listLeavesByStaff(this.staffId);
  }

  apply() {
    if (this.form.invalid) return;

    this.hodData.applyLeave({
      fromDate: this.form.value.fromDate,
      toDate: this.form.value.toDate,
      reason: this.form.value.reason
    });

    this.form.reset();
    this.showApply = false;
    this.load();
  }

  // SIMPLE MODAL OPEN
  openModal(title: string, message: string) {
    this.modalTitle = title;
    this.modalMessage = message;

    const el = document.getElementById('leaveViewModal');
    const modal = new bootstrap.Modal(el!);
    modal.show();
  }

  closeModal() {
    const el = document.getElementById('leaveViewModal');
    const modal = bootstrap.Modal.getInstance(el!);
    modal?.hide();
  }

  view(l: any) {
    this.openModal(
      'Leave Details',
      `
        <strong>From:</strong> ${l.fromDate}<br/>
        <strong>To:</strong> ${l.toDate}<br/>
        <strong>Reason:</strong> ${l.reason}<br/>
        <strong>Status:</strong> <span class="badge 
          ${l.status === 'PENDING' ? 'bg-warning' : l.status === 'APPROVED' ? 'bg-success' : 'bg-danger'}">
          ${l.status}
        </span>
      `
    );
  }
}
