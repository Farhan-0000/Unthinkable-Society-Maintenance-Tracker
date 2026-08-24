export interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'RESIDENT';
  createdAt: string;
}


export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  role?: 'ADMIN' | 'RESIDENT';
}

export type ComplaintStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface ComplaintHistory {
  id: string;
  complaintId: string;
  previousStatus: ComplaintStatus;
  newStatus: ComplaintStatus;
  actorId: string;
  actorRole: 'ADMIN' | 'RESIDENT';
  actor?: Pick<User, 'id' | 'name'>;
  note?: string;
  timestamp: string;
}

export interface Complaint {
  id: string;
  residentId: string;
  resident?: Pick<User, 'id' | 'name' | 'email'>;
  category: string;
  description: string;
  photoUrl?: string;
  status: ComplaintStatus;
  priority: Priority;
  createdAt: string;
  updatedAt: string;
  history?: ComplaintHistory[];
  isOverdue?: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ComplaintFilters {
  status?: ComplaintStatus | '';
  priority?: Priority | '';
  category?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  isOverdue?: boolean;
  page?: number;
  limit?: number;
}

export interface ComplaintStats {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  highPriority: number;
  overdue: number;
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  isImportant: boolean;
  createdAt: string;
  updatedAt: string;
  createdById: string;
  createdBy: Pick<User, 'id' | 'name'>;
}

export interface NoticeFilters {
  search?: string;
  isImportant?: boolean | string;
  page?: number;
  limit?: number;
}

export interface EmailLog {
  id: string;
  to: string;
  subject: string;
  body: string;
  status: 'PENDING' | 'SENT' | 'FAILED';
  error?: string;
  retryCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface EmailLogFilters {
  status?: string;
  page?: number;
  limit?: number;
}

interface ChartDataPoint {
  name: string;
  value: number;
}

export interface AnalyticsData {
  metrics: Omit<ComplaintStats, 'highPriority'>; // Reusing ComplaintStats structure without highPriority since we don't return it natively in the analytics root (we have a chart for it)
  distributions: {
    status: ChartDataPoint[];
    priority: ChartDataPoint[];
    category: ChartDataPoint[];
  };
  monthlyTrend: ChartDataPoint[];
}
