// src/api/tournament.ts
import api from './axios';
import { Tournament } from '../types';

export const getTournaments = () => api.get<Tournament[]>('/torneos');
export const getTournament = (id: number) => api.get<Tournament>(`/torneos/${id}`);
export const createTournament = (data: Partial<Tournament>) => api.post<Tournament>('/torneos', data);
export const updateTournament = (id: number, data: Partial<Tournament>) => api.put<Tournament>(`/torneos/${id}`, data);
export const deleteTournament = (id: number) => api.delete<void>(`/torneos/${id}`);
