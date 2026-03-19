const formatDate = (value) =>
  new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

const formatReportDate = (value) =>
  new Date(value).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

const normalizeTicketRow = (ticket) => ({
  id: ticket.id,
  customer: ticket.customer_name || 'Unknown',
  subject: ticket.subject || 'No subject',
  status: ticket.status || 'open',
  date: formatDate(ticket.created_at),
});

const getLast20OrAll = (tickets) => {
  const sorted = [...tickets].sort((a, b) => {
    const aTime = new Date(a.created_at).getTime();
    const bTime = new Date(b.created_at).getTime();
    return bTime - aTime;
  });

  if (sorted.length <= 20) return sorted;
  return sorted.slice(0, 20);
};

export function buildReportData({
  tickets,
  scope = 'last20',
  selectedIds = new Set(),
  statusFilter = '',
  searchQuery = '',
  generatedAt = new Date(),
}) {
  const selectedSet = selectedIds instanceof Set ? selectedIds : new Set(selectedIds);
  const scopedTickets =
    scope === 'selected' ? tickets.filter((ticket) => selectedSet.has(ticket.id)) : getLast20OrAll(tickets);

  const rows = scopedTickets.map(normalizeTicketRow);
  const openCount = rows.filter((row) => row.status === 'open').length;
  const closedCount = rows.filter((row) => row.status === 'closed').length;

  return {
    generatedAt: generatedAt.toISOString(),
    generatedAtLabel: formatReportDate(generatedAt),
    scope,
    scopeLabel: scope === 'selected' ? 'Selected tickets' : 'Last 20 tickets',
    filters: {
      status: statusFilter || 'all',
      search: searchQuery || '',
    },
    summary: {
      totalFiltered: tickets.length,
      exportedCount: rows.length,
      openCount,
      closedCount,
    },
    rows,
  };
}
