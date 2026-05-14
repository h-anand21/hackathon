import api from './axios';
import { POLLING_TYPES } from '../types/poll.types';
import type { Poll, CreatePollPayload, CreateQuestionPayload, Question } from '../types/poll.types';

// Force runtime dependency for Vite ESM
if (POLLING_TYPES) { /* Types loaded */ }

export const createPoll = async (data: CreatePollPayload): Promise<{ success: boolean; poll: Poll }> => {
  const response = await api.post('/polls', data);
  return response.data;
};

export const getMyPolls = async (): Promise<{ success: boolean; polls: Poll[] }> => {
  const response = await api.get('/polls');
  return response.data;
};

export const getPollById = async (id: string): Promise<{ success: boolean; poll: Poll; questions: Question[] }> => {
  const response = await api.get(`/polls/${id}`);
  return response.data;
};

export const addQuestionToPoll = async (pollId: string, data: CreateQuestionPayload): Promise<{ success: boolean; question: Question; options?: any[] }> => {
  const response = await api.post(`/polls/${pollId}/questions`, data);
  return response.data;
};

export const updatePollStatus = async (pollId: string, status: string): Promise<{ success: boolean; poll: Poll }> => {
  const response = await api.patch(`/polls/${pollId}`, { status });
  return response.data;
};

export const deletePoll = async (pollId: string): Promise<{ success: boolean; message: string }> => {
  const response = await api.delete(`/polls/${pollId}`);
  return response.data;
};
