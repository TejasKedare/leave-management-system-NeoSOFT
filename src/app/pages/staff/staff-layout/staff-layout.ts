import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { User } from '../../../models/user.model';

@Component({
  selector: 'app-staff-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './staff-layout.html',
  styleUrls: ['./staff-layout.scss']
})
export class StaffLayout implements OnInit {
  user: User | null = null;
  initials = '';

  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit() {
    this.user = this.auth.getCurrentUserSync();
    if (this.user?.name) {
      this.initials = this.user.name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0,2);
    }
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/auth/login']);
  }
}
