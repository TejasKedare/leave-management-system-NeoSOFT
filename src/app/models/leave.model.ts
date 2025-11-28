export interface LeaveRequest {
  id: number;
  staffId: number;
  staffName?: string;
  fromDate: string; // yyyy-mm-dd
  toDate: string;   // yyyy-mm-dd
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  appliedOn: string; // ISO string
}
