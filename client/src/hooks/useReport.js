import { useCallback, useState } from 'react';
import { buildReportData } from '../lib/report/reportData.js';
import { buildReportTemplate } from '../lib/report/reportTemplate.js';
import { generateReportPdf } from '../lib/report/reportPdf.js';
import { buildSharePayload, copyShareText, shareByEmail, shareNative } from '../lib/report/reportShare.js';
import { REPORT_SCOPES, STATUS_MODES } from '../lib/constants/dashboard.constants.js';

export default function useReport({ visibleTickets, reportScope, selectedTicketIds, statusMode, searchQuery }) {
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ type, message });
  }, []);

  const makeReport = useCallback(
    () =>
      buildReportData({
        tickets: visibleTickets,
        scope: reportScope,
        selectedIds: selectedTicketIds,
        statusFilter: statusMode === STATUS_MODES.ALL_GROUPED ? '' : statusMode,
        searchQuery,
      }),
    [visibleTickets, reportScope, selectedTicketIds, statusMode, searchQuery]
  );

  const generatePdf = useCallback(async () => {
    setIsGeneratingReport(true);
    try {
      const report = makeReport();
      if (report.scope === REPORT_SCOPES.SELECTED && report.rows.length === 0) {
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
  }, [makeReport, showToast]);

  const shareByEmailReport = useCallback(async () => {
    setIsGeneratingReport(true);
    try {
      const report = makeReport();
      if (report.scope === REPORT_SCOPES.SELECTED && report.rows.length === 0) {
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
  }, [makeReport, showToast]);

  const shareNativeReport = useCallback(async () => {
    setIsGeneratingReport(true);
    try {
      const report = makeReport();
      if (report.scope === REPORT_SCOPES.SELECTED && report.rows.length === 0) {
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
  }, [makeReport, showToast]);

  return {
    isGeneratingReport,
    generatePdf,
    shareByEmail: shareByEmailReport,
    shareNative: shareNativeReport,
    toast,
    setToast,
  };
}
