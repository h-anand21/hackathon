import api from './axios';

export const getPollAnalytics = async (pollId: string) => {
  const response = await api.get(`/analytics/${pollId}`);
  return response.data;
};

export const getPublicResults = async (shareId: string) => {
  const response = await api.get(`/public/poll/${shareId}/results`);
  return response.data;
};
