// ── export.js — TSV Download Logic ──

function downloadTSV(type) {
  let data     = [];
  let filename = 'results.tsv';

  switch (type) {
    case 'all':
      data     = allStudents;
      filename = 'ddcet2026_all_results.tsv';
      break;
    case 'filtered':
      data     = filteredStudents;
      filename = 'ddcet2026_filtered_results.tsv';
      break;
    case 'top10':
      data     = allStudents.slice(0, 10);
      filename = 'ddcet2026_top10.tsv';
      break;
  }

  if (!data.length) {
    showToast('No data to export!', 'warn');
    return;
  }

  const tsv = buildTSV(data);
  triggerDownload(tsv, filename);
  closeExportMenu();
  showToast(`Downloaded ${filename}`, 'success');
}

function buildTSV(students) {
  const headers = ['Rank', 'Name', 'Email', 'Mobile', 'Score', 'Total', 'Time Used (s)', 'Warnings', 'Date'];

  const rows = students.map(s => [
    s.rank        ?? '',
    s.name        ?? '',
    s.email       ?? '',
    s.mobile      ?? '',
    s.score       ?? '',
    s.total       ?? '',
    s.timeUsed    ?? '',
    s.warnings    ?? '',
    s.date ? new Date(s.date).toLocaleDateString('en-IN') : ''
  ]);

  return [headers, ...rows]
    .map(row => row.map(cell => String(cell).replace(/\t/g, ' ').replace(/\r?\n/g, ' ')).join('\t'))
    .join('\r\n');
}

function triggerDownload(content, filename) {
  // BOM ensures Excel opens UTF-8 correctly
  const bom  = '\uFEFF';
  const blob = new Blob([bom + content], { type: 'text/tab-separated-values;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ── Toast notification ──
function showToast(message, type = 'info') {
  // Remove existing toast
  const existing = document.getElementById('toast');
  if (existing) existing.remove();

  const colors = {
    success: { bg: 'rgba(34,197,94,0.12)',  border: 'rgba(34,197,94,0.3)',  color: '#4ade80' },
    warn:    { bg: 'rgba(245,166,35,0.12)', border: 'rgba(245,166,35,0.3)', color: '#fbbf24' },
    info:    { bg: 'rgba(61,127,255,0.12)', border: 'rgba(61,127,255,0.3)', color: '#60a5fa' }
  };

  const c = colors[type] || colors.info;

  const toast = document.createElement('div');
  toast.id = 'toast';
  toast.style.cssText = `
    position: fixed;
    bottom: 1.5rem;
    right: 1.5rem;
    background: ${c.bg};
    border: 1px solid ${c.border};
    color: ${c.color};
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.78rem;
    padding: 0.7rem 1.2rem;
    border-radius: 8px;
    z-index: 300;
    box-shadow: 0 8px 24px rgba(0,0,0,0.4);
    backdrop-filter: blur(8px);
    animation: toastIn 0.3s ease, toastOut 0.3s ease 2.5s forwards;
    pointer-events: none;
  `;
  toast.textContent = message;
  document.body.appendChild(toast);

  // Inject keyframes if not already present
  if (!document.getElementById('toast-style')) {
    const s = document.createElement('style');
    s.id = 'toast-style';
    s.textContent = `
      @keyframes toastIn  { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
      @keyframes toastOut { from { opacity:1; } to { opacity:0; } }
    `;
    document.head.appendChild(s);
  }

  setTimeout(() => toast.remove(), 2900);
}