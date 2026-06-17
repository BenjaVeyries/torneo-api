// src/hooks/useMatches.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMatches, getMatch, createMatch, updateMatch, deleteMatch } from '../api/match';
import { Match } from '../types';

export const useMatches = () => {
  const queryClient = useQueryClient();
  const { data: matches, error, isLoading } = useQuery<Match[]>(['matches'], getMatches);

  const create = useMutation(createMatch, {
    onSuccess: () => queryClient.invalidateQueries(['matches']),
  });
  const update = useMutation(({ id, data }: { id: number; data: Partial<Match> }) => updateMatch(id, data), {
    onSuccess: () => queryClient.invalidateQueries(['matches']),
  });
  const remove = useMutation(deleteMatch, {
    onSuccess: () => queryClient.invalidateQueries(['matches']),
  });

  return { matches, error, isLoading, create, update, remove };
};
