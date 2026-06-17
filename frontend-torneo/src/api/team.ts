// src/api/team.ts
import api from './axios';
import { Team } from '../types';

export const getTeams = async (): Promise<Team[]> => {
  const response = await api.get<Team[]>('/equipos');
  return response.data;
};

export const getTeam = async (id: number): Promise<Team> => {
  const response = await api.get<Team>(`/equipos/${id}`);
  return response.data;
};

export const createTeam = async (team: Partial<Team>): Promise<Team> => {
  const response = await api.post<Team>('/equipos', team);
  return response.data;
};

export const updateTeam = async (id: number, team: Partial<Team>): Promise<Team> => {
  const response = await api.put<Team>(`/equipos/${id}`, team);
  return response.data;
};

export const deleteTeam = async (id: number): Promise<void> => {
  await api.delete(`/equipos/${id}`);
};
