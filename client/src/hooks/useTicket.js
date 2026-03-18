import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchTicket, updateTicketStatus, fetchReplies, addReply } from '../api/tickets.api.js';

export const useTicket = (id) => {
  return useQuery({
    queryKey: ['ticket', id],
    queryFn: () => fetchTicket(id),
    enabled: !!id,
  });
};

export const useReplies = (ticketId) => {
  return useQuery({
    queryKey: ['replies', ticketId],
    queryFn: () => fetchReplies(ticketId),
    enabled: !!ticketId,
  });
};

export const useCloseTicket = (ticketId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => updateTicketStatus(ticketId, 'closed'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket', ticketId] });
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      queryClient.invalidateQueries({ queryKey: ['ticket-stats'] });
    },
  });
};

export const useAddReply = (ticketId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => addReply(ticketId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['replies', ticketId] });
    },
  });
};
