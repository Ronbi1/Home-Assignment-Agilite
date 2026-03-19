import { useState, useMemo } from 'react';
import { LayoutDashboard, Search } from 'lucide-react';
import { useTickets } from '../hooks/useTickets.js';
import TicketTable from '../components/TicketTable.jsx';
import TicketFilters from '../components/TicketFilters.jsx';
import AnalyticsStrip from '../components/AnalyticsStrip.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';

export default function DashboardPage() {
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const { data: tickets = [], isLoading, error } = useTickets(statusFilter || undefined);

  const filteredTickets = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return tickets;

    const includesQuery = (value) => String(value ?? '').toLowerCase().includes(q);

    return tickets.filter(
      (t) =>
        includesQuery(t.id) ||
        includesQuery(t.customer_name) ||
        includesQuery(t.subject)
    );
  }, [tickets, searchQuery]);

  return (
    <div className="p-4 sm:p-8">
      <div className="mb-7">
        <div className="flex items-center gap-3 mb-1">
          <LayoutDashboard size={22} className="text-indigo-600" />
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Dashboard</h1>
        </div>
        <p className="text-slate-500 dark:text-slate-400 text-sm">Manage and track all customer support tickets</p>
      </div>

      <AnalyticsStrip />

      {error ? (
        <ErrorMessage message="Failed to load tickets. Please try again." />
      ) : (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <TicketFilters activeFilter={statusFilter} onChange={setStatusFilter} />
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tickets..."
                className="pl-9 pr-3 py-1.5 w-full sm:w-56 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
              />
            </div>
          </div>
          <div className="flex items-center justify-between mb-3">
            {!isLoading && (
              <p className="text-sm text-slate-400">
                {filteredTickets.length} ticket{filteredTickets.length !== 1 ? 's' : ''}
                {searchQuery.trim() && ` matching "${searchQuery.trim()}"`}
              </p>
            )}
          </div>
          <TicketTable tickets={filteredTickets} isLoading={isLoading} />
        </>
      )}
    </div>
  );
}
