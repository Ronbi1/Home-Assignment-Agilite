import { useEffect, useMemo, useState } from 'react';
import { LayoutDashboard, Search, Download, Mail, Share2, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTickets, useUrgentFeed } from '../hooks/useTickets.js';
import useFilteredTickets from '../hooks/useFilteredTickets.js';
import useReport from '../hooks/useReport.js';
import TicketTable from '../components/TicketTable.jsx';
import TicketFilters from '../components/TicketFilters.jsx';
import AnalyticsStrip from '../components/AnalyticsStrip.jsx';
import UrgentFeedCard from '../components/UrgentFeedCard.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import PageLoadingState from '../components/PageLoadingState.jsx';
import { Badge } from '../components/ui/badge.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card.jsx';
import { Input } from '../components/ui/input.jsx';
import { Button } from '../components/ui/button.jsx';
import { REPORT_SCOPES, SORT_MODES, STATUS_MODES } from '../lib/constants/dashboard.constants.js';

function ToastMessage({ toast, onClose }) {
  if (!toast) return null;
  const palette =
    toast.type === 'error'
      ? 'border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-900/30 dark:text-red-300'
      : 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-900/30 dark:text-emerald-300';

  return (
    <div className={`mb-4 flex items-center justify-between rounded-lg border px-3 py-2 text-sm ${palette}`}>
      <span>{toast.message}</span>
      <button onClick={onClose} className="ml-4 text-xs font-semibold opacity-80 hover:opacity-100">
        Dismiss
      </button>
    </div>
  );
}

function AiFirstReplyCard({ tickets, onOpenTicket }) {
  return (
    <Card className="h-full border-border/70 bg-card/95 shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-500 dark:bg-indigo-500/15">
            <Sparkles size={16} />
          </div>
          <div className="flex flex-col">
            <span>AI First Replies</span>
            <span className="text-sm font-normal text-muted-foreground">New tickets that already received an automatic first response.</span>
          </div>
          <Badge
            variant="outline"
            className="ml-auto border-transparent bg-indigo-500/15 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-300"
          >
            {tickets.length} open
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {tickets.length === 0 ? (
          <p className="text-sm text-muted-foreground">No AI-first replies are waiting right now.</p>
        ) : (
          <div className="space-y-2">
            {tickets.map((ticket) => (
              <button
                key={ticket.id}
                type="button"
                onClick={() => onOpenTicket(ticket.id)}
                className="flex w-full items-start justify-between rounded-xl border border-border/70 px-4 py-3 text-left transition-colors hover:bg-accent/50 cursor-pointer"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">{ticket.subject}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {ticket.id}
                    {ticket.customer_name ? ` · ${ticket.customer_name}` : ''}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className="ml-3 border-transparent bg-indigo-500/15 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-300"
                >
                  AI First
                </Badge>
              </button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  // state
  const [statusMode, setStatusMode] = useState(STATUS_MODES.ALL_GROUPED);
  const [sortMode, setSortMode] = useState(SORT_MODES.DATE_DESC);
  const [productFilter, setProductFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [reportScope, setReportScope] = useState(REPORT_SCOPES.LAST_20);
  const [selectedTicketIds, setSelectedTicketIds] = useState([]);

  // data hooks
  const { data: tickets = [], isLoading, error } = useTickets();
  const { data: urgentFeed = [], isLoading: isUrgentLoading, error: urgentError } = useUrgentFeed(20);

  // derived data (useMemo / custom hooks)
  const productOptions = useMemo(() => {
    const products = new Map();
    for (const ticket of tickets) {
      if (!ticket.product_id) continue;
      const label = ticket.product_title?.trim() || `Product #${ticket.product_id}`;
      products.set(String(ticket.product_id), label);
    }
    return Array.from(products.entries())
      .map(([value, label]) => ({ value, label }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [tickets]);

  const visibleTickets = useFilteredTickets({
    tickets,
    searchQuery,
    statusMode,
    productFilter,
    sortMode,
  });
  const aiFirstTickets = useMemo(
    () => tickets.filter((ticket) => ticket.status === 'open' && ticket.has_ai_first_reply),
    [tickets],
  );

  const {
    isGeneratingReport,
    generatePdf,
    shareByEmail,
    shareNative,
    toast,
    setToast,
  } = useReport({
    visibleTickets,
    reportScope,
    selectedTicketIds,
    statusMode,
    searchQuery,
  });

  // effects
  useEffect(() => {
    const visibleIdSet = new Set(visibleTickets.map((ticket) => ticket.id));

    // Avoid unnecessary state updates when the selected ids are already aligned.
    setSelectedTicketIds((prev) => {
      const next = prev.filter((id) => visibleIdSet.has(id));
      if (next.length === prev.length && next.every((id, index) => id === prev[index])) {
        return prev;
      }
      return next;
    });
  }, [visibleTickets]);

  // handlers
  const handleToggleTicket = (ticketId) => {
    setSelectedTicketIds((prev) => (prev.includes(ticketId) ? prev.filter((id) => id !== ticketId) : [...prev, ticketId]));
  };

  const handleSelectAll = () => {
    setSelectedTicketIds(visibleTickets.map((ticket) => ticket.id));
  };

  const handleClearAll = () => {
    setSelectedTicketIds([]);
  };

  // render
  if (isLoading) {
    return (
      <div className="p-4 sm:p-8">
        <div className="mb-7">
          <div className="flex items-center gap-3 mb-1">
            <LayoutDashboard size={22} className="text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          </div>
          <p className="text-sm text-muted-foreground">Manage and track all customer support tickets</p>
        </div>
        <PageLoadingState message="Loading dashboard tickets..." />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8">
      <div className="mb-7">
        <div className="flex items-center gap-3 mb-1">
          <LayoutDashboard size={22} className="text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        </div>
        <p className="text-sm text-muted-foreground">Manage and track all customer support tickets</p>
      </div>

      <ToastMessage toast={toast} onClose={() => setToast(null)} />

      <AnalyticsStrip />
      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <AiFirstReplyCard tickets={aiFirstTickets} onOpenTicket={(ticketId) => navigate(`/tickets/${ticketId}`)} />
        <UrgentFeedCard items={urgentFeed} tickets={tickets} isLoading={isUrgentLoading} error={urgentError} />
      </div>

      {error ? (
        <ErrorMessage message="Failed to load tickets. Please try again." />
      ) : (
        <>
          <Card className="mb-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Tickets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start sm:gap-x-4 sm:gap-y-4">
                <div className="min-w-0">
                  <TicketFilters
                    statusMode={statusMode}
                    onStatusModeChange={setStatusMode}
                    sortMode={sortMode}
                    onSortModeChange={setSortMode}
                    productFilter={productFilter}
                    onProductFilterChange={setProductFilter}
                    productOptions={productOptions}
                  />
                </div>

                <div className="min-w-0 sm:row-start-2 sm:col-start-1">
                  <div className="relative w-full sm:w-64 sm:max-w-full">
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

                <div className="flex min-w-0 flex-col gap-2 sm:col-start-2 sm:row-start-1 sm:min-w-[220px] sm:justify-self-end">
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="reportScope" className="text-xs font-medium text-muted-foreground">
                      Report scope
                    </label>
                    <select
                      id="reportScope"
                      value={reportScope}
                      onChange={(event) => setReportScope(event.target.value)}
                      className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
                      disabled={isGeneratingReport}
                    >
                      <option value={REPORT_SCOPES.LAST_20}>Last 20 tickets</option>
                      <option value={REPORT_SCOPES.SELECTED}>Selected tickets</option>
                    </select>
                  </div>
                  {reportScope === REPORT_SCOPES.SELECTED ? (
                    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleSelectAll}
                        disabled={isGeneratingReport}
                        className="w-full justify-center sm:w-auto"
                      >
                        Select all
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleClearAll}
                        disabled={isGeneratingReport}
                        className="w-full justify-center sm:w-auto"
                      >
                        Clear all
                      </Button>
                    </div>
                  ) : null}
                </div>

                <div className="flex flex-col gap-2 sm:col-start-2 sm:row-start-2 sm:flex-row sm:flex-wrap sm:justify-self-end">
                  <Button
                    size="sm"
                    onClick={generatePdf}
                    disabled={isGeneratingReport}
                    className="w-full justify-center sm:w-auto"
                  >
                    <Download size={14} className="mr-1.5" />
                    {isGeneratingReport ? 'Generating...' : 'Export PDF'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={shareByEmail}
                    disabled={isGeneratingReport}
                    className="w-full justify-center sm:w-auto"
                  >
                    <Mail size={14} className="mr-1.5" />
                    Email
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={shareNative}
                    disabled={isGeneratingReport}
                    className="w-full justify-center sm:w-auto"
                  >
                    <Share2 size={14} className="mr-1.5" />
                    Share
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="mb-3 flex items-center justify-between">
            {!isLoading && (
              <p className="text-sm text-muted-foreground">
                {visibleTickets.length} ticket{visibleTickets.length !== 1 ? 's' : ''}
                {searchQuery.trim() && ` matching "${searchQuery.trim()}"`}
              </p>
            )}
          </div>
          <TicketTable
            tickets={visibleTickets}
            isLoading={isLoading}
            selectable={reportScope === REPORT_SCOPES.SELECTED}
            selectedTicketIds={selectedTicketIds}
            onToggleTicket={handleToggleTicket}
          />
        </>
      )}
    </div>
  );
}
