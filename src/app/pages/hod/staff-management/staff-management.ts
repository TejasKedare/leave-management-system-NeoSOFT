import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { HodDataService } from '../../../services/hod.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-staff-management',
  standalone: true,
  imports: [CommonModule,FormsModule, ReactiveFormsModule],
  templateUrl: './staff-management.html',
  styleUrls: ['./staff-management.scss']
})
export class StaffManagement {
  department = 'IT'; // TEMP until Auth is integrated

  staffList: any[] = [];
  filteredList: any[] = [];

  page = 1;
  pageSize = 10;
  totalPages = 1;

  sortBy = 'name';
  sortDir: 'asc' | 'desc' = 'asc';

  searchQuery = '';
  showAdd = false;

  form: any;
  submitting: boolean = false;

  constructor(
    private fb: FormBuilder,
    private hodData: HodDataService,
    private toastr: ToastrService
  ) { }

  ngOnInit() {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.pattern(/^[A-Za-z ]+$/)]],
      username: ['', [Validators.required, Validators.minLength(3), Validators.pattern(/^\S+$/)]],
      email: ['', [Validators.required, Validators.email, Validators.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/)]],
      mobile: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      department: [this.department, Validators.required]
    });

    // default department if not present
    if (!this.form.value.department) {
      this.form.patchValue({ department: 'IT' });
    }

    this.loadStaff();
  }

  // LOAD STAFF FROM SERVICE
  loadStaff() {
    this.staffList = this.hodData.getStaffByDepartment(this.department);
    this.applyFilters();
  }

  applyFilters() {
    let data = [...this.staffList];

    if (this.searchQuery.trim() !== '') {
      const q = this.searchQuery.toLowerCase();
      data = data.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.username.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q)
      );
    }

    data.sort((a, b) => {
      const A = (a[this.sortBy] || '').toString().toLowerCase();
      const B = (b[this.sortBy] || '').toString().toLowerCase();
      if (A < B) return this.sortDir === 'asc' ? -1 : 1;
      if (A > B) return this.sortDir === 'asc' ? 1 : -1;
      return 0;
    });

    this.filteredList = data;
    this.calculatePages();
  }

  calculatePages() {
    this.totalPages = Math.max(1, Math.ceil(this.filteredList.length / this.pageSize));
    if (this.page > this.totalPages) this.page = this.totalPages;
  }

  get pageData() {
    const start = (this.page - 1) * this.pageSize;
    return this.filteredList.slice(start, start + this.pageSize);
  }

  changePage(p: number) {
    if (p < 1 || p > this.totalPages) return;
    this.page = p;
  }

  toggleSort(column: string) {
    if (this.sortBy === column) {
      this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = column;
      this.sortDir = 'asc';
    }
    this.applyFilters();
  }

  // ADD STAFF
  addStaff() {
    if (!this.form) {
      this.toastr.error("Form not initialized");
      return;
    }

    if (this.form.invalid) {
      Object.keys(this.form.controls).forEach(key => {
        this.form.controls[key].markAsTouched();
      });

      this.toastr.error("Please fill all required fields correctly.", "Form Error");
      return;
    }

    this.submitting = true;

    const payload = { ...this.form.value };

    this.hodData.addStaff(payload);
    this.toastr.success("Staff added successfully!", "Success");
    this.showAdd = false;

    // Reset form but keep department
    this.form.reset({ department: this.department });

    this.submitting = false;
    this.loadStaff();
  }

  // DELETE STAFF
  deleteStaff(id: number) {
    if (!confirm('Delete this staff?')) return;
    this.hodData.deleteStaff(id);
    this.toastr.success("Staff deleted successfully!", "Deleted");
    this.loadStaff();
  }

  get f() {
    return this.form.controls;
  }

  allowNumbersOnly(event: any) {
  const cleaned = (event.target.value || '').replace(/[^0-9]/g, '');
  event.target.value = cleaned;
  this.form.patchValue({ mobile: cleaned });
}

}
