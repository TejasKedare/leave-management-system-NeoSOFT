import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule,RouterLink,ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class Login {

  form: any;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.form = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  submit() {
    if (this.form.invalid) {
      alert("Please fill in both fields.");
      return;
    }

    const { username, password } = this.form.value;

    this.auth.login(username!, password!).subscribe((res: any) => {
      if (!res.success) {
        alert(res.message || "Invalid username or password");
        return;
      }

      const user = res.user;

      if (user.role === 'HOD') this.router.navigate(['/hod/dashboard']);
      else this.router.navigate(['/staff/dashboard']);
    });
  }
}
