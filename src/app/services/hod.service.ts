import { Injectable } from '@angular/core';
import { User } from '../models/user.model';
import { LeaveRequest } from '../models/leave.model';

const STAFF_KEY = 'app_staff';
const LEAVES_KEY = 'app_leaves';
const CURRENT_USER_KEY = 'current_user';

@Injectable({ providedIn: 'root' })
export class HodDataService {

  constructor() {}

  // ----------------------------------------------------------------
  // BASIC GETTERS
  // ----------------------------------------------------------------

  private readLS<T>(key: string, fallback: T): T {
    return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));
  }

  private writeLS(key: string, data: any) {
    localStorage.setItem(key, JSON.stringify(data));
  }

  getStaff(): User[] {
    return this.readLS<User[]>(STAFF_KEY, []);
  }

  getLeaves(): LeaveRequest[] {
    return this.readLS<LeaveRequest[]>(LEAVES_KEY, []).map(l => ({
      ...l,
      id: Number(l.id),
      staffId: Number(l.staffId),
    }));
  }

  // ----------------------------------------------------------------
  // STAFF CRUD
  // ----------------------------------------------------------------

  addStaff(newStaff: User) {
    try {
      const staff = this.getStaff();

      // Generate next numeric ID
      const newId =
        newStaff.id != null
          ? Number(newStaff.id)
          : staff.length
          ? Math.max(...staff.map(s => Number(s.id))) + 1
          : 1;

      const entry = { ...newStaff, id: newId };
      staff.push(entry);

      this.writeLS(STAFF_KEY, staff);

      return { success: true, message: 'Staff added successfully' };
    } catch {
      return { success: false, message: 'Failed to add staff' };
    }
  }

  deleteStaff(id: number) {
    try {
      const staff = this.getStaff().filter(s => Number(s.id) !== id);
      this.writeLS(STAFF_KEY, staff);

      return { success: true, message: 'Staff deleted successfully' };
    } catch {
      return { success: false, message: 'Failed to delete staff' };
    }
  }

  getStaffByDepartment(dept: string): User[] {
    return this.getStaff().filter(s => s.department === dept);
  }

  // ----------------------------------------------------------------
  // LEAVE OPERATIONS
  // ----------------------------------------------------------------

  getLeavesByDepartment(dept: string): LeaveRequest[] {
    const staffInDept = this.getStaffByDepartment(dept);
    const staffIds = staffInDept.map(s => Number(s.id));

    return this.getLeaves().filter(l => staffIds.includes(Number(l.staffId)));
  }

  updateLeaveStatus(id: number, status: 'APPROVED' | 'REJECTED'): void {
    const leaves = this.getLeaves();
    const index = leaves.findIndex(l => Number(l.id) === id);

    if (index !== -1) {
      leaves[index].status = status;
      this.writeLS(LEAVES_KEY, leaves);
    }
  }

  listLeavesByStaff(staffId: number): LeaveRequest[] {
    return this.getLeaves().filter(
      l => Number(l.staffId) === Number(staffId)
    );
  }

  // ----------------------------------------------------------------
  // APPLY LEAVE (uses logged-in user only)
  // ----------------------------------------------------------------

  applyLeave(data: { fromDate: string; toDate: string; reason: string }) {
    const leaves = this.getLeaves();
    const currentUser = this.readLS<any>(CURRENT_USER_KEY, { id: 0, name: '' });

    const newLeave: LeaveRequest = {
      id: Date.now(),
      staffId: Number(currentUser.id),
      staffName: currentUser.name || '',
      fromDate: data.fromDate,
      toDate: data.toDate,
      reason: data.reason,
      status: 'PENDING',
      appliedOn: new Date().toISOString(),
    };

    leaves.push(newLeave);
    this.writeLS(LEAVES_KEY, leaves);

    return newLeave;
  }
}
