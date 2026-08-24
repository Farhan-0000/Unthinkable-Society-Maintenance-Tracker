import api from './api';

export const settingService = {
  getSettings: async () => {
    const response = await api.get('/settings');
    return response.data;
  },

  updateSettings: async (overdueThresholdDays: number) => {
    const response = await api.patch('/settings', { overdueThresholdDays });
    return response.data;
  },
};
