import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { HodDataService } from '../../../services/hod.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './register.html',
  styleUrls: ['./register.scss']
})
export class Register {

  role: 'HOD' | 'STAFF' = 'STAFF';
  profilePreview = '';
  form: any;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private hodData: HodDataService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
      this.form = this.fb.group({
    name: ['', Validators.required],
    username: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    mobile: ['', Validators.required],
    department: ['', Validators.required],
    password: ['', [Validators.required, Validators.minLength(6)]],
    profileImage: ['']
  }); 
    // determine role from URL: '/auth/register/hod' or '/auth/register/staff'
    const segs = this.route.snapshot.url.map(s => s.path);
    // If parent path contains 'register' and child is 'hod' or 'staff'
    if (segs.includes('hod')) this.role = 'HOD';
    else if (segs.includes('staff')) this.role = 'STAFF';
    // fallback: check route path
    const path = this.route.snapshot.routeConfig?.path || '';
    if (path.includes('hod')) this.role = 'HOD';
    // prefill department for convenience (optional)
    if (!this.form.value.department) this.form.patchValue({ department: 'IT' });
  }

  onFileChange(ev: Event) {
    const input = ev.target as HTMLInputElement;
    if (!input.files || !input.files[0]) return;
    const f = input.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      this.profilePreview = reader.result as string;
      this.form.patchValue({ profileImage: this.profilePreview });
    };
    reader.readAsDataURL(f);
  }

  submit() {
  if (this.form.invalid) {
    alert('Please fill required fields correctly.');
    return;
  }

  const payload = {
    ...this.form.value,
    role: this.role
  };

  // Register user in users store
  this.auth.register(payload as any).subscribe((res: any) => {
    if (!res.success) {
      alert(res.message || 'Registration failed');
      return;
    }

    // If staff, add to HodDataService staff list (so HOD sees them)
   if (this.role === 'STAFF') {
  const createdUser = res.user; // auth.register returned the created user with id
  this.hodData.addStaff({
    id: Number(createdUser.id),  // reuse exact id
    name: payload.name,
    username: payload.username,
    email: payload.email,
    mobile: payload.mobile,
    department: payload.department,
    role: 'STAFF',
    profileImage: payload.profileImage
  });
}

    // Auto-login the newly created user
    this.auth.login(payload.username, payload.password).subscribe((loginRes: any) => {
      if (!loginRes.success) {
        // fallback: if auto-login fails, ask user to login manually
        alert('Registered but auto-login failed. Please login manually.');
        this.router.navigate(['/auth/login']);
        return;
      }

      // On successful login, navigate to the appropriate dashboard
      if (loginRes.user.role === 'HOD') {
        this.router.navigate(['/hod/dashboard']);
      } else {
        this.router.navigate(['/staff/dashboard']);
      }
    });
  });
}

}
