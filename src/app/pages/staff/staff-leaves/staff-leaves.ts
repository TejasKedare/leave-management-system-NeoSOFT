import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HodDataService } from '../../../services/hod.service';
import { AuthService } from '../../../services/auth.service';
import { FormBuilder, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';

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
  form: any
  today = new Date().toISOString().split('T')[0];

  constructor(private hodData: HodDataService, private auth: AuthService, private fb: FormBuilder) { }

  ngOnInit() {
    this.form = this.fb.group({
      fromDate: ['', Validators.required],
      toDate: ['', Validators.required],
      reason: ['', Validators.required]
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


  view(l: any) {
    alert(`From: ${l.fromDate}\nTo: ${l.toDate}\nReason: ${l.reason}\nStatus: ${l.status}`);
  }
}
