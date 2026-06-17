// src/api/player.ts
import api from './axios';
import { Player } from '../types';

export const getPlayers = async (): Promise<Player[]> => {
  const response = await api.get<Player[]>('/jugadores');
  return response.data;
};

export const getPlayer = async (id: number): Promise<Player> => {
  const response = await api.get<Player>(`/jugadores/${id}`);
  return response.data;
};

export const createPlayer = async (player: Partial<Player>): Promise<Player> => {
  const response = await api.post<Player>('/jugadores', player);
  return response.data;
};

export const updatePlayer = async (id: number, player: Partial<Player>): Promise<Player> => {
  const response = await api.put<Player>(`/jugadores/${id}`, player);
  return response.data;
};

export const deletePlayer = async (id: number): Promise<void> => {
  await api.delete(`/jugadores/${id}`);
};
