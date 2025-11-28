import { Injectable } from '@angular/core';
import { DataLoaderService } from './data-loader.service';
import { User } from '../models/user.model';
import { LeaveRequest } from '../models/leave.model';
import { Observable, of } from 'rxjs';
import { tap, switchMap } from 'rxjs/operators';

const STAFF_KEY = 'app_staff';
const LEAVES_KEY = 'app_leaves';

@Injectable({ providedIn: 'root' })
export class HodDataService {

  constructor(private loader: DataLoaderService) { }

  // ----------------------------------------------------------------
  // INIT + MIGRATION (Fixes old LocalStorage IDs permanently)
  // ----------------------------------------------------------------
  init(): Observable<boolean> {

    // Normalize existing LS data on startup
    this.migrateLocalStorageIfNeeded();

    const staffLS = localStorage.getItem(STAFF_KEY);
    const leavesLS = localStorage.getItem(LEAVES_KEY);

    // If already loaded and normalized → done
    if (staffLS && leavesLS) {
      return of(true);
    }

    // Otherwise load seed JSON files and normalize
    return this.loader.loadJSON<User[]>('staff.json').pipe(
      tap(staff => {
        const normalized = staff.map(s => ({ ...s, id: Number(s.id) }));
        localStorage.setItem(STAFF_KEY, JSON.stringify(normalized));
      }),

      switchMap(() =>
        this.loader.loadJSON<LeaveRequest[]>('leaves.json').pipe(
          tap(leaves => {
            const normalized = (leaves || []).map((l: any, idx: number) => ({
              ...l,
              id: Number(l.id) || idx + 1,  // keep JSON IDs or auto-increment
              staffId: Number(l.staffId),  // KEEP the JSON staffId
            }));

            localStorage.setItem(LEAVES_KEY, JSON.stringify(normalized));
          })


        )
      ),

      switchMap(() => of(true))
    );
  }

  // ----------------------------------------------------------------
  // AUTO-MIGRATE EXISTING LOCAL STORAGE
  // ----------------------------------------------------------------
  private migrateLocalStorageIfNeeded() {
    try {
      // Normalize staff IDs
      const staffRaw = localStorage.getItem(STAFF_KEY);
      if (staffRaw) {
        const staff = JSON.parse(staffRaw || '[]').map((s: any) => ({
          ...s,
          id: Number(s.id)
        }));
        localStorage.setItem(STAFF_KEY, JSON.stringify(staff));
      }

      // Normalize leaves IDs & staffId
      const leavesRaw = localStorage.getItem(LEAVES_KEY);
      if (leavesRaw) {
        const leaves = JSON.parse(leavesRaw || '[]').map((l: any) => ({
          ...l,
          id: Number(l.id),
          staffId: Number(l.staffId)
        }));
        localStorage.setItem(LEAVES_KEY, JSON.stringify(leaves));
      }

      // Normalize current_user (important for applyLeave)
      const cuRaw = localStorage.getItem('current_user');
      if (cuRaw) {
        const cu = JSON.parse(cuRaw);
        cu.id = Number(cu.id);
        localStorage.setItem('current_user', JSON.stringify(cu));
      }

      console.info('LocalStorage normalized successfully');
    } catch (err) {
      console.error('Migration failed', err);
    }
  }

  // ----------------------------------------------------------------
  // BASIC GETTERS
  // ----------------------------------------------------------------
  getStaff(): User[] {
    return JSON.parse(localStorage.getItem(STAFF_KEY) || '[]');
  }

  getLeaves(): LeaveRequest[] {
    return (JSON.parse(localStorage.getItem(LEAVES_KEY) || '[]') as any[]).map(l => ({
      ...l,
      id: Number(l.id),
      staffId: Number(l.staffId)
    }));
  }

  // ----------------------------------------------------------------
  // STAFF CRUD
  // ----------------------------------------------------------------
  addStaff(newStaff: any) {
    const staff = this.getStaff();

    // Use provided id if valid, otherwise create a stable incremental id
    const providedId = newStaff.id ? Number(newStaff.id) : NaN;
    const newId = !Number.isNaN(providedId)
      ? providedId
      : (staff.length > 0 ? Math.max(...staff.map(s => Number(s.id))) + 1 : 1);

    newStaff.id = newId;

    staff.push(newStaff);
    localStorage.setItem(STAFF_KEY, JSON.stringify(staff));

    return true;
  }


  deleteStaff(id: number) {
    const staff = this.getStaff().filter(s => s.id !== id);
    localStorage.setItem(STAFF_KEY, JSON.stringify(staff));
    return true;
  }

  getStaffByDepartment(dept: string) {
    return this.getStaff().filter(s => s.department === dept);
  }

  // ----------------------------------------------------------------
  // LEAVE OPERATIONS
  // ----------------------------------------------------------------

  getLeavesByDepartment(dept: string) {
    const staffInDept = this.getStaffByDepartment(dept);
    const staffIds = staffInDept.map(s => Number(s.id));

    console.log(staffInDept, ' staffInDept ');
    console.log(staffIds, ' staffIds ');
    console.log(this.getLeaves(), ' his.getLeaves() ');


    return this.getLeaves().filter(l =>
      staffIds.includes(Number(l.staffId))
    );
  }



  updateLeaveStatus(id: number, status: 'APPROVED' | 'REJECTED') {
    const leaves = this.getLeaves();
    const index = leaves.findIndex(l => l.id === id);

    if (index !== -1) {
      leaves[index].status = status;
      localStorage.setItem(LEAVES_KEY, JSON.stringify(leaves));
    }
  }

  listLeavesByStaff(staffId: number) {
    return this.getLeaves().filter(l => Number(l.staffId) === Number(staffId));
  }

  // ----------------------------------------------------------------
  // APPLY LEAVE (ALWAYS USE LOGGED-IN USER)
  // ----------------------------------------------------------------
  applyLeave(data: { fromDate: string; toDate: string; reason: string }) {
    const leaves = this.getLeaves();

    // Logged-in user always decides staffId
    const currentUser = JSON.parse(localStorage.getItem('current_user') || '{}');

    const newLeave: LeaveRequest = {
      id: Date.now(),
      staffId: Number(currentUser.id) || 0,
      staffName: currentUser?.name || '',
      fromDate: data.fromDate,
      toDate: data.toDate,
      reason: data.reason,
      status: 'PENDING',
      appliedOn: new Date().toISOString()
    };

    leaves.push(newLeave);
    localStorage.setItem(LEAVES_KEY, JSON.stringify(leaves));

    return newLeave;
  }
}
