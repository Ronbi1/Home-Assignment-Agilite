import axios from 'axios';

const BASE = '/api/tickets';

export const fetchTickets = async (status) => {
  const params = status ? { status } : {};
  const { data } = await axios.get(BASE, { params });
  return data;
};

export const fetchTicket = async (id) => {
  const { data } = await axios.get(`${BASE}/${id}`);
  return data;
};

export const createTicket = async (payload) => {
  const { data } = await axios.post(BASE, payload);
  return data;
};

export const updateTicketStatus = async (id, status) => {
  const { data } = await axios.patch(`${BASE}/${id}/status`, { status });
  return data;
};

export const fetchReplies = async (ticketId) => {
  const { data } = await axios.get(`${BASE}/${ticketId}/replies`);
  return data;
};

export const addReply = async (ticketId, payload) => {
  const { data } = await axios.post(`${BASE}/${ticketId}/replies`, payload);
  return data;
};

export const fetchStats = async () => {
  const { data } = await axios.get(`${BASE}/stats`);
  return data;
};
