const buildSummaryText = (report) => {
  const lines = [
    `Agilite SupportDesk Report`,
    `Generated: ${report.generatedAtLabel}`,
    `Scope: ${report.scopeLabel}`,
    `Exported tickets: ${report.summary.exportedCount}`,
    `Open: ${report.summary.openCount} | Closed: ${report.summary.closedCount}`,
  ];
  return lines.join('\n');
};

export function buildSharePayload(report) {
  const text = buildSummaryText(report);
  return {
    title: `Agilite Report - ${report.generatedAtLabel}`,
    text,
    emailSubject: `Agilite SupportDesk Report - ${report.generatedAtLabel}`,
    emailBody: text,
  };
}

export function shareByEmail(payload) {
  const url = `mailto:?subject=${encodeURIComponent(payload.emailSubject)}&body=${encodeURIComponent(payload.emailBody)}`;
  window.location.href = url;
}

export async function shareNative(payload) {
  if (!navigator.share) {
    throw new Error('Native share is not supported on this device.');
  }
  await navigator.share({
    title: payload.title,
    text: payload.text,
  });
}

export async function copyShareText(payload) {
  await navigator.clipboard.writeText(payload.text);
}
