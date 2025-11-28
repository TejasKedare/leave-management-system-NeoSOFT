import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { HodDataService } from '../../../services/hod.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-staff-management',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
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

  addForm: any;

  constructor(
    private hodData: HodDataService,
    private fb: FormBuilder,
    private toastr: ToastrService
  ) { }

  ngOnInit() {

    // FIX 1 — initialize form WITH department
    this.addForm = this.fb.group({
      name: ['', Validators.required],
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      mobile: [''],
      department: [this.department]
    });

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
    this.totalPages = Math.ceil(this.filteredList.length / this.pageSize);
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
    if (!this.addForm) return;

    if (this.addForm.invalid) {
      Object.keys(this.addForm.controls).forEach(key => {
        this.addForm.controls[key].markAsTouched();
      });
      this.toastr.error("Please fill all required fields correctly.", "Form Error");
      return;
    }
    this.hodData.addStaff(this.addForm.value);
    this.toastr.success("Staff added successfully!", "Success");
    this.showAdd = false;
    // Reset form but keep department
    this.addForm.reset({ department: this.department });
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
    return this.addForm.controls;
  }


}
