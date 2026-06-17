// src/hooks/useTeams.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '../api/team';
import { Team } from '../types';

export const useTeams = () => {
  const queryClient = useQueryClient();

  const teamsQuery = useQuery<Team[]>(['teams'], api.getTeams);

  const createTeamMutation = useMutation(api.createTeam, {
    onSuccess: () => queryClient.invalidateQueries(['teams']),
  });

  const updateTeamMutation = useMutation(({ id, team }: { id: number; team: Partial<Team> }) => api.updateTeam(id, team), {
    onSuccess: () => queryClient.invalidateQueries(['teams']),
  });

  const deleteTeamMutation = useMutation((id: number) => api.deleteTeam(id), {
    onSuccess: () => queryClient.invalidateQueries(['teams']),
  });

  return {
    ...teamsQuery,
    createTeam: createTeamMutation.mutate,
    updateTeam: updateTeamMutation.mutate,
    deleteTeam: deleteTeamMutation.mutate,
  };
};
