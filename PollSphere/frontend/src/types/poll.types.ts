export type PollResponseMode = 'anonymous' | 'authenticated';
export type PollStatus = 'draft' | 'active' | 'expired' | 'published';

// Dummy constant to ensure Vite generates a valid JS module for type imports
export const POLLING_TYPES = true;

export interface Option {
  _id?: string;
  text: string;
}

export interface Question {
  _id?: string;
  text: string;
  isMandatory: boolean;
  allowMultiple: boolean;
  options: Option[];
}

export interface Poll {
  _id: string;
  title: string;
  description?: string;
  responseMode: PollResponseMode;
  expiresAt: string;
  status: PollStatus;
  createdAt: string;
}

export interface CreatePollPayload {
  title: string;
  description?: string;
  responseMode: PollResponseMode;
  expiresAt: string;
}

export interface CreateQuestionPayload {
  text: string;
  isMandatory: boolean;
  allowMultiple: boolean;
  options: string[];
}
