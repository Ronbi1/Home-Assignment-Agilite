import { useState, useMemo } from 'react';
import { LayoutDashboard, Search } from 'lucide-react';
import { useTickets } from '../hooks/useTickets.js';
import TicketTable from '../components/TicketTable.jsx';
import TicketFilters from '../components/TicketFilters.jsx';
import AnalyticsStrip from '../components/AnalyticsStrip.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card.jsx';
import { Input } from '../components/ui/input.jsx';

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
          <LayoutDashboard size={22} className="text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        </div>
        <p className="text-sm text-muted-foreground">Manage and track all customer support tickets</p>
      </div>

      <AnalyticsStrip />

      {error ? (
        <ErrorMessage message="Failed to load tickets. Please try again." />
      ) : (
        <>
          <Card className="mb-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Tickets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <TicketFilters activeFilter={statusFilter} onChange={setStatusFilter} />
                <div className="relative w-full sm:w-64">
                  <Search
                    size={15}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                  <Input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search tickets..."
                    className="pl-9"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="mb-3 flex items-center justify-between">
            {!isLoading && (
              <p className="text-sm text-muted-foreground">
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
