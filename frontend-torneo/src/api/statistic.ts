// src/api/statistic.ts
import api from './axios';
import { Statistic } from '../types';

export const getStatistics = async (): Promise<Statistic[]> => {
  const response = await api.get<Statistic[]>('/estadisticas');
  return response.data;
};

export const getStatistic = async (id: number): Promise<Statistic> => {
  const response = await api.get<Statistic>(`/estadisticas/${id}`);
  return response.data;
};

export const createStatistic = async (stat: Partial<Statistic>): Promise<Statistic> => {
  const response = await api.post<Statistic>('/estadisticas', stat);
  return response.data;
};

export const updateStatistic = async (id: number, stat: Partial<Statistic>): Promise<Statistic> => {
  const response = await api.put<Statistic>(`/estadisticas/${id}`, stat);
  return response.data;
};

export const deleteStatistic = async (id: number): Promise<void> => {
  await api.delete(`/estadisticas/${id}`);
};
