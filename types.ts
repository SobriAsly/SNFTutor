
export interface Student {
  id: string;
  name: string;
  color: string;
  defaultHours?: number;
  pricePerHour?: number;
}

export interface ClassSession {
  id: string;
  studentId?: string; // Optional for general events
  title?: string;     // For general events like "School Break"
  color?: string;     // Custom color for general events
  type: 'SESSION' | 'EVENT' | 'QUICK';
  date: string;       // Start Date (ISO format: YYYY-MM-DD)
  endDate?: string;   // Optional End Date for events (ISO format: YYYY-MM-DD)
  rescheduledTo?: string; // New date if postponed (ISO format: YYYY-MM-DD)
  originalSessionId?: string; // ID of the original session if this is a rescheduled one
  startTime?: string; // HH:mm (Optional)
  duration?: string;  // Format: HH:MM (Optional)
  customHours?: number; // Override student/monthly defaultHours
  customPrice?: number; // Override student/monthly pricePerHour
  notes?: string;
}

export interface PaymentInfo {
  studentId: string;
  month: number;
  year: number;
  isPaid: boolean;
  paidDate?: string;
  monthlyHours?: number;
  monthlyPrice?: number;
}

export type ViewType = 'MASTER' | 'INCOME' | string; // 'MASTER', 'INCOME' or Student.id
