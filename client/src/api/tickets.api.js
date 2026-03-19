import api from '../lib/axios.js';

const BASE = '/api/tickets';

export const fetchTickets = async (status) => {
  const params = status ? { status } : {};
  const { data } = await api.get(BASE, { params });
  return data;
};

export const fetchTicket = async (id) => {
  const { data } = await api.get(`${BASE}/${id}`);
  return data;
};

export const createTicket = async (payload) => {
  const { data } = await api.post(BASE, payload);
  return data;
};

export const updateTicketStatus = async (id, status) => {
  const { data } = await api.patch(`${BASE}/${id}/status`, { status });
  return data;
};

export const fetchReplies = async (ticketId) => {
  const { data } = await api.get(`${BASE}/${ticketId}/replies`);
  return data;
};

export const addReply = async (ticketId, payload) => {
  const { data } = await api.post(`${BASE}/${ticketId}/replies`, payload);
  return data;
};

export const fetchStats = async () => {
  const { data } = await api.get(`${BASE}/stats`);
  return data;
};

export const suggestReply = async (ticketId) => {
  const { data } = await api.post('/api/ai/suggest-reply', { ticketId });
  return data;
};
