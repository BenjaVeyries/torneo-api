// src/hooks/useStatistics.ts
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { getStatistics, createStatistic, updateStatistic, deleteStatistic } from '../api/statistic';
import { Statistic } from '../types';

export const useStatistics = () => {
  const queryClient = useQueryClient();
  const { data: stats, error, isLoading } = useQuery<Statistic[]>(['statistics'], getStatistics);

  const createStat = useMutation(createStatistic, {
    onSuccess: () => queryClient.invalidateQueries(['statistics']),
  });
  const updateStat = useMutation(({ id, data }: { id: number; data: Partial<Statistic> }) => updateStatistic(id, data), {
    onSuccess: () => queryClient.invalidateQueries(['statistics']),
  });
  const deleteStat = useMutation((id: number) => deleteStatistic(id), {
    onSuccess: () => queryClient.invalidateQueries(['statistics']),
  });

  return {
    stats,
    error,
    isLoading,
    createStat: createStat.mutate,
    updateStat: updateStat.mutate,
    deleteStat: deleteStat.mutate,
  };
};
