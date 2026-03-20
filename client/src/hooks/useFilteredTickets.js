import { useMemo } from 'react';
import { SORT_MODES, STATUS_MODES } from '../lib/constants/dashboard.constants.js';

export const filterTickets = ({ tickets, searchQuery, statusMode, productFilter }) => {
  const q = searchQuery.trim().toLowerCase();
  const includesQuery = (value) => String(value ?? '').toLowerCase().includes(q);

  const filteredByQuery = tickets.filter(
    (ticket) =>
      !q ||
      includesQuery(ticket.id) ||
      includesQuery(ticket.customer_name) ||
      includesQuery(ticket.subject)
  );

  const filteredByStatus = filteredByQuery.filter((ticket) => {
    if (statusMode === STATUS_MODES.OPEN) return ticket.status === STATUS_MODES.OPEN;
    if (statusMode === STATUS_MODES.CLOSED) return ticket.status === STATUS_MODES.CLOSED;
    return true;
  });

  return filteredByStatus.filter((ticket) => {
    if (productFilter === 'all') return true;
    return String(ticket.product_id) === productFilter;
  });
};

export const sortTickets = ({ tickets, statusMode, sortMode }) => {
  return [...tickets].sort((a, b) => {
    if (statusMode === STATUS_MODES.ALL_GROUPED && a.status !== b.status) {
      return a.status === STATUS_MODES.OPEN ? -1 : 1;
    }

    if (sortMode === SORT_MODES.ALPHA) {
      return String(a.customer_name ?? '').localeCompare(String(b.customer_name ?? ''), undefined, { sensitivity: 'base' });
    }

    const timeA = new Date(a.created_at).getTime();
    const timeB = new Date(b.created_at).getTime();
    const safeA = Number.isFinite(timeA) ? timeA : 0;
    const safeB = Number.isFinite(timeB) ? timeB : 0;
    if (sortMode === SORT_MODES.DATE_ASC) return safeA - safeB;
    return safeB - safeA;
  });
};

export default function useFilteredTickets({ tickets, searchQuery, statusMode, productFilter, sortMode }) {
  return useMemo(() => {
    const filtered = filterTickets({ tickets, searchQuery, statusMode, productFilter });
    return sortTickets({ tickets: filtered, statusMode, sortMode });
  }, [tickets, searchQuery, statusMode, productFilter, sortMode]);
}
