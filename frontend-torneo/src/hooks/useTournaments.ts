// src/hooks/useTournaments.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Tournament } from '../types';
import * as api from '../api/tournament';

export const useTournaments = () => {
  return useQuery<Tournament[], Error>(['tournaments'], api.getTournaments);
};

export const useCreateTournament = () => {
  const queryClient = useQueryClient();
  return useMutation(api.createTournament, {
    onSuccess: () => queryClient.invalidateQueries(['tournaments']),
  });
};

export const useUpdateTournament = () => {
  const queryClient = useQueryClient();
  return useMutation(({ id, data }: { id: number; data: Partial<Tournament> }) => api.updateTournament(id, data), {
    onSuccess: () => queryClient.invalidateQueries(['tournaments']),
  });
};

export const useDeleteTournament = () => {
  const queryClient = useQueryClient();
  return useMutation((id: number) => api.deleteTournament(id), {
    onSuccess: () => queryClient.invalidateQueries(['tournaments']),
  });
};
