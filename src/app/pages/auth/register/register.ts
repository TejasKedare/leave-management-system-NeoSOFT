import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { HodDataService } from '../../../services/hod.service';
import { ToastrService } from 'ngx-toastr';

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
  submitting = false;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private hodData: HodDataService,
    private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService
  ) { }

  ngOnInit() {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.pattern(/^[A-Za-z ]+$/)]],
      username: ['', [Validators.required, Validators.minLength(3), Validators.pattern(/^\S+$/)]],
      email: ['', [Validators.required, Validators.email, Validators.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/)]],
      mobile: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      department: ['', Validators.required],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(6),
          // Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{6,}$/)
        ]
      ],
      profileImage: ['']
    });

    // detect role
    const segs = this.route.snapshot.url.map(s => s.path);
    if (segs.includes('hod')) this.role = 'HOD';
    if (segs.includes('staff')) this.role = 'STAFF';

    // default department
    if (!this.form.value.department) {
      this.form.patchValue({ department: 'IT' });
    }
  }

  // file change
  onFileChange(ev: Event) {
    const input = ev.target as HTMLInputElement;
    if (!input.files || !input.files[0]) return;
    const file = input.files[0];

    const reader = new FileReader();
    reader.onload = () => {
      this.profilePreview = reader.result as string;
      this.form.patchValue({ profileImage: this.profilePreview });
    };
    reader.readAsDataURL(file);
  }

  allowNumbersOnly(event: any) {
    const cleaned = (event.target.value || '').replace(/[^0-9]/g, '');
    event.target.value = cleaned;
    this.form.patchValue({ mobile: cleaned });
  }

  get f() {
    return this.form.controls;
  }

  submit() {

    if (!this.form) {
      this.toastr.error("Form not initialized");
      return;
    }

    if (this.form.invalid) {

      // mark all as touched so errors appear in UI
      Object.keys(this.form.controls).forEach(key => {
        this.form.controls[key].markAsTouched();
      });

      this.toastr.error('Please fill all required fields.', 'Form Error');
      return; // ⭐ STOP RIGHT HERE
    }

    // If form is valid → continue
    this.submitting = true;

    const payload = { ...this.form.value, role: this.role };

    this.auth.register(payload).subscribe({
      next: (res: any) => {
        this.submitting = false;

        if (!res.success) {
          this.toastr.error(res.message || 'Registration failed', 'Error');
          return;
        }

        this.toastr.success('Registration successful!', 'Success');

        // STAFF auto-save
        if (this.role === 'STAFF') {
          const createdUser = res.user;
          this.hodData.addStaff({
            id: Number(createdUser.id),
            name: payload.name,
            username: payload.username,
            email: payload.email,
            mobile: payload.mobile,
            department: payload.department,
            role: 'STAFF',
            profileImage: payload.profileImage
          });
        }

        // Auto-login
        this.auth.login(payload.username, payload.password).subscribe({
          next: loginRes => {
            if (!loginRes.success) {
              this.toastr.warning('Registered but auto-login failed.', 'Warning');
              this.router.navigate(['/auth/login']);
              return;
            }

            this.toastr.success('Logged in successfully!', 'Welcome');

            if (loginRes.user?.role === 'HOD') {
              this.router.navigate(['/hod/dashboard']);
            } else {
              this.router.navigate(['/staff/dashboard']);
            }
          },
          error: () => {
            this.toastr.warning('Registered but auto-login failed.', 'Warning');
            this.router.navigate(['/auth/login']);
          }
        });
      },

      error: () => {
        this.submitting = false;
        this.toastr.error('Server error. Please try again.', 'Server Error');
      }
    });
  }

}
