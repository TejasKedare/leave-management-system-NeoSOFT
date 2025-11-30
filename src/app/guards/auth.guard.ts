import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard {

  constructor(private auth: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {

    const user = this.auth.getCurrentUserSync();

    if (!user) {
      this.router.navigate(['/auth/login']);
      return false;
    }

    const allowedRoles = route.data?.['roles'] as string[] | undefined;

    if (allowedRoles && !allowedRoles.includes(user.role)) {
      if (user.role === 'HOD') {
        this.router.navigate(['hod','dashboard']);
      } else {
        this.router.navigate(['staff','dashboard']);
      }
      return false;
    }

    return true;
  }
}
