import api from './api';
import type { EmailLog, EmailLogFilters, PaginatedResponse } from '../types';

export const emailLogService = {
  getEmailLogs: async (filters?: EmailLogFilters) => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const response = await api.get<PaginatedResponse<EmailLog>>(`/emails?${params.toString()}`);
    return response.data;
  },

  retryEmail: async (id: string) => {
    const response = await api.post<{ message: string; log: EmailLog }>(`/emails/${id}/retry`);
    return response.data;
  },
};
