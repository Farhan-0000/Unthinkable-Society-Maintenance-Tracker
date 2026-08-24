import api from './api';
import type { Notice, NoticeFilters, PaginatedResponse } from '../types';

export const noticeService = {
  getNotices: async (filters?: NoticeFilters) => {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.isImportant !== undefined) params.append('isImportant', String(filters.isImportant));
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const response = await api.get<PaginatedResponse<Notice>>(`/notices?${params.toString()}`);
    return response.data;
  },

  createNotice: async (data: Partial<Notice>) => {
    const response = await api.post<{ notice: Notice }>('/notices', data);
    return response.data.notice;
  },

  updateNotice: async (id: string, data: Partial<Notice>) => {
    const response = await api.patch<{ notice: Notice }>(`/notices/${id}`, data);
    return response.data.notice;
  },

  deleteNotice: async (id: string) => {
    const response = await api.delete<{ message: string }>(`/notices/${id}`);
    return response.data;
  },
};
