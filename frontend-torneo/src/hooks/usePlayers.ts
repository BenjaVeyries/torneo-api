// src/hooks/usePlayers.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '../api/player';
import { Player } from '../types';

export const usePlayers = () => {
  const queryClient = useQueryClient();

  const playersQuery = useQuery<Player[]>(['players'], api.getPlayers);

  const createPlayer = useMutation(api.createPlayer, {
    onSuccess: () => queryClient.invalidateQueries(['players']),
  });

  const updatePlayer = useMutation(({ id, player }: { id: number; player: Partial<Player> }) => api.updatePlayer(id, player), {
    onSuccess: () => queryClient.invalidateQueries(['players']),
  });

  const deletePlayer = useMutation((id: number) => api.deletePlayer(id), {
    onSuccess: () => queryClient.invalidateQueries(['players']),
  });

  return {
    ...playersQuery,
    createPlayer: createPlayer.mutate,
    updatePlayer: updatePlayer.mutate,
    deletePlayer: deletePlayer.mutate,
  };
};
