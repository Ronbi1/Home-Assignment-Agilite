const escapeHtml = (value) =>
  String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

export function buildReportTemplate(report) {
  const rowsHtml = report.rows
    .map(
      (row) => `
        <tr>
          <td>${escapeHtml(row.id)}</td>
          <td>${escapeHtml(row.customer)}</td>
          <td>${escapeHtml(row.subject)}</td>
          <td style="text-transform: capitalize;">${escapeHtml(row.status)}</td>
          <td>${escapeHtml(row.date)}</td>
        </tr>
      `
    )
    .join('');

  return `
    <section style="background:#fff;color:#0f172a;width:794px;padding:28px 28px 20px;font-family:Inter,Arial,sans-serif;">
      <header style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;border-bottom:1px solid #e2e8f0;padding-bottom:14px;">
        <div style="display:flex;align-items:center;gap:12px;">
          <img
            src="/assets/agilite-logo.png"
            alt="Agilite"
            style="height:30px;max-width:180px;object-fit:contain;"
            crossorigin="anonymous"
            onerror="this.style.display='none';this.nextElementSibling.style.display='inline';"
          />
          <span style="display:none;font-weight:700;font-size:18px;">Agilite</span>
          <span style="font-size:15px;color:#334155;font-weight:600;">SupportDesk Report</span>
        </div>
        <div style="text-align:right;font-size:12px;color:#475569;">
          <div style="font-weight:600;">Report Date</div>
          <div>${escapeHtml(report.generatedAtLabel)}</div>
        </div>
      </header>

      <section style="display:flex;gap:10px;margin-bottom:16px;flex-wrap:wrap;">
        <span style="background:#eff6ff;color:#1d4ed8;border:1px solid #bfdbfe;border-radius:999px;padding:4px 10px;font-size:12px;font-weight:600;">
          Scope: ${escapeHtml(report.scopeLabel)}
        </span>
        <span style="background:#f8fafc;color:#334155;border:1px solid #e2e8f0;border-radius:999px;padding:4px 10px;font-size:12px;font-weight:600;">
          Exported: ${escapeHtml(report.summary.exportedCount)}
        </span>
        <span style="background:#f8fafc;color:#334155;border:1px solid #e2e8f0;border-radius:999px;padding:4px 10px;font-size:12px;font-weight:600;">
          Open: ${escapeHtml(report.summary.openCount)}
        </span>
        <span style="background:#f8fafc;color:#334155;border:1px solid #e2e8f0;border-radius:999px;padding:4px 10px;font-size:12px;font-weight:600;">
          Closed: ${escapeHtml(report.summary.closedCount)}
        </span>
      </section>

      <table style="width:100%;border-collapse:collapse;font-size:12px;">
        <thead>
          <tr style="background:#f8fafc;">
            <th style="text-align:left;padding:8px;border:1px solid #e2e8f0;">Ticket</th>
            <th style="text-align:left;padding:8px;border:1px solid #e2e8f0;">Customer</th>
            <th style="text-align:left;padding:8px;border:1px solid #e2e8f0;">Subject</th>
            <th style="text-align:left;padding:8px;border:1px solid #e2e8f0;">Status</th>
            <th style="text-align:left;padding:8px;border:1px solid #e2e8f0;">Date</th>
          </tr>
        </thead>
        <tbody>${rowsHtml}</tbody>
      </table>
    </section>
  `;
}
