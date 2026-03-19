const waitForImages = async (container) => {
  const images = Array.from(container.querySelectorAll('img'));
  if (images.length === 0) return;

  await Promise.all(
    images.map(
      (img) =>
        new Promise((resolve) => {
          if (img.complete) {
            resolve();
            return;
          }
          img.onload = () => resolve();
          img.onerror = () => resolve();
        })
    )
  );
};

const renderContainer = (html) => {
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-10000px';
  container.style.top = '0';
  container.style.width = '794px';
  container.style.zIndex = '-1';
  container.innerHTML = html;
  document.body.appendChild(container);
  return container;
};

export async function generateReportPdf({ html, fileName }) {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([import('html2canvas'), import('jspdf')]);
  const container = renderContainer(html);

  try {
    await waitForImages(container);
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
    });

    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const imgData = canvas.toDataURL('image/png');
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let renderedHeight = 0;
    let pageIndex = 0;
    while (renderedHeight < imgHeight) {
      if (pageIndex > 0) pdf.addPage();
      const yOffset = -renderedHeight;
      pdf.addImage(imgData, 'PNG', 0, yOffset, imgWidth, imgHeight);
      renderedHeight += pageHeight;
      pageIndex += 1;
    }

    const safeName = fileName || `agilite-report-${new Date().toISOString().slice(0, 10)}.pdf`;
    pdf.save(safeName);
    return { fileName: safeName };
  } finally {
    document.body.removeChild(container);
  }
}
