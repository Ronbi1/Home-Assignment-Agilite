import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchTickets, createTicket, fetchStats, fetchUrgentFeed } from '../api/tickets.api.js';

export const useTickets = (status) => {
  return useQuery({
    queryKey: ['tickets', status],
    queryFn: () => fetchTickets(status),
  });
};

export const useTicketStats = () => {
  return useQuery({
    queryKey: ['ticket-stats'],
    queryFn: fetchStats,
  });
};

export const useCreateTicket = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createTicket,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      queryClient.invalidateQueries({ queryKey: ['ticket-stats'] });
    },
  });
};

export const useUrgentFeed = (limit = 5) => {
  return useQuery({
    queryKey: ['urgent-feed', limit],
    queryFn: () => fetchUrgentFeed(limit),
    staleTime: 60 * 1000,
  });
};
