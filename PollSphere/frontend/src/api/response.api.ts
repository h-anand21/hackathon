import api from './axios';

export const getPublicPoll = async (shareId: string) => {
  const response = await api.get(`/public/poll/${shareId}`);
  return response.data;
};

export const submitVote = async (shareId: string, answers: { questionId: string, optionId?: string, optionIds?: string[] }[]) => {
  const response = await api.post(`/public/poll/${shareId}/submit`, { answers });
  return response.data;
};
