import { useState } from 'react';
import { LayoutDashboard } from 'lucide-react';
import { useTickets } from '../hooks/useTickets.js';
import TicketTable from '../components/TicketTable.jsx';
import TicketFilters from '../components/TicketFilters.jsx';
import AnalyticsStrip from '../components/AnalyticsStrip.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';

export default function DashboardPage() {
  const [statusFilter, setStatusFilter] = useState('');
  const { data: tickets = [], isLoading, error } = useTickets(statusFilter || undefined);

  return (
    <div className="p-4 sm:p-8">
      <div className="mb-7">
        <div className="flex items-center gap-3 mb-1">
          <LayoutDashboard size={22} className="text-indigo-600" />
          <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
        </div>
        <p className="text-slate-500 text-sm">Manage and track all customer support tickets</p>
      </div>

      <AnalyticsStrip />

      {error ? (
        <ErrorMessage message="Failed to load tickets. Please try again." />
      ) : (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <TicketFilters activeFilter={statusFilter} onChange={setStatusFilter} />
            {!isLoading && (
              <p className="text-sm text-slate-400">
                {tickets.length} ticket{tickets.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>
          <TicketTable tickets={tickets} isLoading={isLoading} />
        </>
      )}
    </div>
  );
}
