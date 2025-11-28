import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';
import { User } from '../../../models/user.model';

@Component({
  selector: 'app-hod-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './hod-layout.html',
  styleUrls: ['./hod-layout.scss']
})
export class HodLayout implements OnInit {

  user: User | null = null;
  initials = '';

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.user = this.auth.getCurrentUserSync();

    if (this.user && this.user.name) {
      // generate initials for fallback avatar
      const parts = this.user.name.split(' ');
      this.initials = parts.map(p => p[0]).join('').toUpperCase().substring(0,2);
    }
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/auth/login']);
  }
}
