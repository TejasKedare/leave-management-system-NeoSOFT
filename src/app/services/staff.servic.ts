import { Injectable } from '@angular/core';
import { DataLoaderService } from './data-loader.service';
import { User } from '../models/user.model';
import { map, tap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

const STORAGE_KEY = 'staff_list';

@Injectable({ providedIn: 'root' })
export class StaffService {
  constructor(private loader: DataLoaderService) {}

  initData(): Observable<User[]> {
    const ls = localStorage.getItem(STORAGE_KEY);

    if (ls) {
      return of(JSON.parse(ls));
    }

    return this.loader.loadJSON<User[]>('/assets/data/staff.json').pipe(
      tap(data => localStorage.setItem(STORAGE_KEY, JSON.stringify(data)))
    );
  }

  getStaff(): Observable<User[]> {
    return of(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'));
  }

  addStaff(staff: User): Observable<User> {
    const list: User[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    staff.id = Date.now();
    list.push(staff);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    return of(staff);
  }

  deleteStaff(id: number): Observable<boolean> {
    let list: User[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    list = list.filter(s => s.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    return of(true);
  }
}
