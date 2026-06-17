// src/api/participant.ts
import api from './axios';
import { Participant } from '../types';

export const getParticipants = async (): Promise<Participant[]> => {
  const response = await api.get<Participant[]>('/participantes');
  return response.data;
};

export const getParticipant = async (id: number): Promise<Participant> => {
  const response = await api.get<Participant>(`/participantes/${id}`);
  return response.data;
};

export const createParticipant = async (participant: Partial<Participant>): Promise<Participant> => {
  const response = await api.post<Participant>('/participantes', participant);
  return response.data;
};

export const updateParticipant = async (id: number, participant: Partial<Participant>): Promise<Participant> => {
  const response = await api.put<Participant>(`/participantes/${id}`, participant);
  return response.data;
};

export const deleteParticipant = async (id: number): Promise<void> => {
  await api.delete(`/participantes/${id}`);
};
