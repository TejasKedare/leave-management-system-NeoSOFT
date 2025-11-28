import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { User } from '../models/user.model';

const CURRENT_USER_KEY = 'current_user';
const USERS_KEY = 'app_users';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUser$ = new BehaviorSubject<User | null>(null);

  constructor() {
    const saved = localStorage.getItem(CURRENT_USER_KEY);
    if (saved) this.currentUser$.next(JSON.parse(saved));
    // initialize users store if missing
    if (!localStorage.getItem(USERS_KEY)) {
      localStorage.setItem(USERS_KEY, JSON.stringify([]));
    }
  }

  private getAllUsers(): User[] {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  }

  private saveAllUsers(users: User[]) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }

  register(user: User): Observable<{ success: boolean; user?: User; message?: string }> {
    const users = this.getAllUsers();
    
    if (users.find(u => u.username === user.username)) {
      return of({ success: false, message: 'Username already exists' });
    }

    user.id = Date.now();
    users.push(user);
    this.saveAllUsers(users);
    return of({ success: true, user });
  }


  login(username: string, password: string): Observable<{ success: boolean; user?: User; message?: string }> {
    const users = this.getAllUsers();
    const user = users.find(u => u.username === username && u.password === password);

    if (!user) {
      return of({ success: false, message: 'Invalid username or password' });
    }

    localStorage.setItem('current_user', JSON.stringify(user));
    this.currentUser$.next(user);

    return of({ success: true, user });
  }

  logout() {
    localStorage.removeItem(CURRENT_USER_KEY);
    this.currentUser$.next(null);
  }

  currentUserChanges() {
    return this.currentUser$.asObservable();
  }

  getCurrentUserSync(): User | null {
    return this.currentUser$.value;
  }
}
