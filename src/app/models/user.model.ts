export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  mobile: string;
  department: string;
  password?: string;
  role: 'HOD' | 'STAFF';
  profileImage?: string;
}
