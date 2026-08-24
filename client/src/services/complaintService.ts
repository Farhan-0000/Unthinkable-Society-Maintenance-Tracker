import api from './api';
import type { Complaint, ComplaintFilters, ComplaintStats, PaginatedResponse, AnalyticsData } from '../types';

export const complaintService = {
  getComplaints: async (filters?: ComplaintFilters) => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, String(value));
      });
    }
    const response = await api.get<{ complaints: Complaint[]; pagination: PaginatedResponse<Complaint>['pagination'] }>(`/complaints?${params.toString()}`);
    return response.data;
  },

  getComplaintStats: async () => {
    const response = await api.get<ComplaintStats>('/complaints/stats');
    return response.data;
  },

  getComplaint: async (id: string) => {
    const response = await api.get<{ complaint: Complaint }>(`/complaints/${id}`);
    return response.data;
  },

  createComplaint: async (formData: FormData) => {
    const response = await api.post<{ complaint: Complaint }>('/complaints', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  updateComplaint: async (id: string, data: Partial<Complaint>) => {
    const response = await api.patch<{ complaint: Complaint }>(`/complaints/${id}`, data);
    return response.data;
  },

  deleteComplaint: async (id: string) => {
    const response = await api.delete<{ message: string }>(`/complaints/${id}`);
    return response.data;
  },

  getAnalytics: async (dateFrom?: string, dateTo?: string) => {
    const params = new URLSearchParams();
    if (dateFrom) params.append('dateFrom', dateFrom);
    if (dateTo) params.append('dateTo', dateTo);
    
    const response = await api.get<AnalyticsData>(`/complaints/analytics?${params.toString()}`);
    return response.data;
  }
};
