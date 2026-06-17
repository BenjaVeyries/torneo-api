// src/hooks/useParticipants.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Participant } from '../types';
import * as api from '../api/participant';

// Fetch all participants
export const useParticipants = () => {
  return useQuery<Participant[], Error>(['participants'], api.getParticipants);
};

// Create participant
export const useCreateParticipant = () => {
  const queryClient = useQueryClient();
  return useMutation(api.createParticipant, {
    onSuccess: () => queryClient.invalidateQueries(['participants']),
  });
};

// Update participant
export const useUpdateParticipant = () => {
  const queryClient = useQueryClient();
  return useMutation(({ id, data }: { id: number; data: Partial<Participant> }) =>
    api.updateParticipant(id, data), {
    onSuccess: () => queryClient.invalidateQueries(['participants']),
  });
};

// Delete participant
export const useDeleteParticipant = () => {
  const queryClient = useQueryClient();
  return useMutation((id: number) => api.deleteParticipant(id), {
    onSuccess: () => queryClient.invalidateQueries(['participants']),
  });
};
