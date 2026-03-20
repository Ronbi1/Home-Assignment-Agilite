import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchTickets, createTicket, deleteTicket, fetchStats, fetchUrgentFeed } from '../api/tickets.api.js';

const normalizeTicket = (ticket) => ({
  ...ticket,
  has_ai_first_reply: Boolean(ticket?.has_ai_first_reply),
});

export const useTickets = (status) => {
  return useQuery({
    queryKey: ['tickets', status],
    queryFn: () => fetchTickets(status),
    select: (tickets = []) => tickets.map(normalizeTicket),
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

export const useDeleteTicket = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteTicket,
    onSuccess: (_, ticketId) => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      queryClient.invalidateQueries({ queryKey: ['ticket-stats'] });
      queryClient.invalidateQueries({ queryKey: ['ticket', ticketId] });
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
