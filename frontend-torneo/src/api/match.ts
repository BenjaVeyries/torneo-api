// src/api/match.ts
import api from './axios';
import { Match } from '../types';

export const getMatches = async (): Promise<Match[]> => {
  const response = await api.get<Match[]>('/partidos');
  return response.data;
};

export const getMatch = async (id: number): Promise<Match> => {
  const response = await api.get<Match>(`/partidos/${id}`);
  return response.data;
};

export const createMatch = async (match: Partial<Match>): Promise<Match> => {
  const response = await api.post<Match>('/partidos', match);
  return response.data;
};

export const updateMatch = async (id: number, match: Partial<Match>): Promise<Match> => {
  const response = await api.put<Match>(`/partidos/${id}`, match);
  return response.data;
};

export const deleteMatch = async (id: number): Promise<void> => {
  await api.delete(`/partidos/${id}`);
};
