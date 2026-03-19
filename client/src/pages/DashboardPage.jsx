import { useEffect, useMemo, useState } from 'react';
import { LayoutDashboard, Search, Download, Mail, Share2 } from 'lucide-react';
import { useTickets } from '../hooks/useTickets.js';
import TicketTable from '../components/TicketTable.jsx';
import TicketFilters from '../components/TicketFilters.jsx';
import AnalyticsStrip from '../components/AnalyticsStrip.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card.jsx';
import { Input } from '../components/ui/input.jsx';
import { Button } from '../components/ui/button.jsx';
import { buildReportData } from '../lib/report/reportData.js';
import { buildReportTemplate } from '../lib/report/reportTemplate.js';
import { generateReportPdf } from '../lib/report/reportPdf.js';
import { buildSharePayload, copyShareText, shareByEmail, shareNative } from '../lib/report/reportShare.js';

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

export default function DashboardPage() {
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [reportScope, setReportScope] = useState('last20');
  const [selectedTicketIds, setSelectedTicketIds] = useState([]);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [toast, setToast] = useState(null);
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

  useEffect(() => {
    const filteredIdSet = new Set(filteredTickets.map((ticket) => ticket.id));
    setSelectedTicketIds((prev) => prev.filter((id) => filteredIdSet.has(id)));
  }, [filteredTickets]);

  const isAllSelected = useMemo(() => {
    if (filteredTickets.length === 0) return false;
    return filteredTickets.every((ticket) => selectedTicketIds.includes(ticket.id));
  }, [filteredTickets, selectedTicketIds]);

  const makeReport = () =>
    buildReportData({
      tickets: filteredTickets,
      scope: reportScope,
      selectedIds: selectedTicketIds,
      statusFilter,
      searchQuery,
    });

  const showToast = (message, type = 'success') => {
    setToast({ type, message });
  };

  const handleToggleTicket = (ticketId) => {
    setSelectedTicketIds((prev) => (prev.includes(ticketId) ? prev.filter((id) => id !== ticketId) : [...prev, ticketId]));
  };

  const handleSelectAll = () => {
    setSelectedTicketIds(filteredTickets.map((ticket) => ticket.id));
  };

  const handleClearAll = () => {
    setSelectedTicketIds([]);
  };

  const handleGenerateReportPdf = async () => {
    setIsGeneratingReport(true);
    try {
      const report = makeReport();
      if (report.scope === 'selected' && report.rows.length === 0) {
        showToast('Please select at least one ticket before exporting.', 'error');
        return;
      }

      const html = buildReportTemplate(report);
      await generateReportPdf({
        html,
        fileName: `agilite-report-${new Date().toISOString().slice(0, 10)}.pdf`,
      });
      showToast('Report downloaded successfully.');
    } catch {
      showToast('Failed to generate report. Please try again.', 'error');
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const handleShareByEmail = async () => {
    setIsGeneratingReport(true);
    try {
      const report = makeReport();
      if (report.scope === 'selected' && report.rows.length === 0) {
        showToast('Please select at least one ticket before sharing.', 'error');
        return;
      }
      shareByEmail(buildSharePayload(report));
      showToast('Opening your email app.');
    } catch {
      showToast('Failed to prepare email share.', 'error');
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const handleNativeShare = async () => {
    setIsGeneratingReport(true);
    try {
      const report = makeReport();
      if (report.scope === 'selected' && report.rows.length === 0) {
        showToast('Please select at least one ticket before sharing.', 'error');
        return;
      }
      const payload = buildSharePayload(report);
      try {
        await shareNative(payload);
        showToast('Shared successfully.');
      } catch {
        await copyShareText(payload);
        showToast('Share text copied to clipboard.');
      }
    } catch {
      showToast('Failed to share report. Please try again.', 'error');
    } finally {
      setIsGeneratingReport(false);
    }
  };

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
              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap items-center gap-2">
                  <label htmlFor="reportScope" className="text-xs font-medium text-muted-foreground">
                    Report scope
                  </label>
                  <select
                    id="reportScope"
                    value={reportScope}
                    onChange={(event) => setReportScope(event.target.value)}
                    className="h-9 rounded-md border border-input bg-background px-2 text-sm"
                    disabled={isGeneratingReport}
                  >
                    <option value="last20">Last 20 tickets</option>
                    <option value="selected">Selected tickets</option>
                  </select>
                  {reportScope === 'selected' ? (
                    <>
                      <Button variant="outline" size="sm" onClick={handleSelectAll} disabled={isGeneratingReport}>
                        Select all
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleClearAll} disabled={isGeneratingReport}>
                        Clear all
                      </Button>
                    </>
                  ) : null}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button size="sm" onClick={handleGenerateReportPdf} disabled={isGeneratingReport}>
                    <Download size={14} className="mr-1.5" />
                    {isGeneratingReport ? 'Generating...' : 'Export PDF'}
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleShareByEmail} disabled={isGeneratingReport}>
                    <Mail size={14} className="mr-1.5" />
                    Email
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleNativeShare} disabled={isGeneratingReport}>
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
                {filteredTickets.length} ticket{filteredTickets.length !== 1 ? 's' : ''}
                {searchQuery.trim() && ` matching "${searchQuery.trim()}"`}
              </p>
            )}
          </div>
          <TicketTable
            tickets={filteredTickets}
            isLoading={isLoading}
            selectable={reportScope === 'selected'}
            selectedTicketIds={selectedTicketIds}
            onToggleTicket={handleToggleTicket}
          />
        </>
      )}
    </div>
  );
}
