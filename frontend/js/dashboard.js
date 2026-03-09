// ── dashboard.js — Main Dashboard Logic ──
// Firestore fields: name, email, mobile, score, total, timeUsed, warnings, timestamp

// Auth guard
if (sessionStorage.getItem('ddcet_auth') !== 'true') {
  window.location.replace('index.html');
}

function handleLogout() {
  if (typeof detachRealtimeListener === 'function') detachRealtimeListener();
  sessionStorage.removeItem('ddcet_auth');
  window.location.replace('index.html');
}

// ── Global State ──
let allStudents      = [];
let filteredStudents = [];

// ── Called by realtime.js on every Firestore snapshot ──────
function onDataUpdate(students) {
  // Sort: score desc → timeUsed asc (higher score wins; faster time breaks tie)
  allStudents = students.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return (a.timeUsed || 9999) - (b.timeUsed || 9999);
  });

  allStudents.forEach((s, i) => { s.rank = i + 1; });

  const query = document.getElementById('search-input').value.trim().toLowerCase();
  filteredStudents = query ? filterStudents(allStudents, query) : [...allStudents];

  updateStats();
  renderTable(filteredStudents);
  renderLeaderboard(allStudents.slice(0, 10));
  updateExportCounts();
}

// ── Stats ──────────────────────────────────────────────────
function updateStats() {
  const today = new Date().toDateString();
  let totalScore = 0, todayCount = 0;

  allStudents.forEach(s => {
    totalScore += s.score || 0;
    // Handle Firestore Timestamp objects and ISO strings
    const dateStr = s.date ? new Date(s.date).toDateString() : '';
    if (dateStr === today) todayCount++;
  });

  const avg = allStudents.length ? Math.round(totalScore / allStudents.length) : 0;

  animateNumber('stat-total', allStudents.length);
  animateNumber('stat-high',  allStudents.length ? allStudents[0].score : 0);
  animateNumber('stat-avg',   avg);
  animateNumber('stat-today', todayCount);
}

function animateNumber(id, target) {
  const el = document.getElementById(id);
  if (!el) return;
  const start = parseInt(el.textContent) || 0;
  const startTime = performance.now();
  function update(now) {
    const progress = Math.min((now - startTime) / 600, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(start + (target - start) * ease);
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

// ── Table Render ───────────────────────────────────────────
function renderTable(students) {
  const tbody   = document.getElementById('table-body');
  const countEl = document.getElementById('result-count');
  countEl.textContent = students.length;

  if (!students.length) {
    tbody.innerHTML = `
      <tr><td colspan="9" class="table-empty">
        <div class="no-data">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <span>No results found</span>
        </div>
      </td></tr>`;
    return;
  }

  tbody.innerHTML = students.map(s => {
    const rowClass = s.rank <= 3 ? `row-r${s.rank}` : '';
    const rankIcon = s.rank === 1 ? '🥇' : s.rank === 2 ? '🥈' : s.rank === 3 ? '🥉' : `#${s.rank}`;
    const dateStr  = s.date ? formatDate(s.date) : '—';
    const timeStr  = s.timeUsed ? formatTime(s.timeUsed) : '—';
    // Score out of total: e.g. "24 / 30"
    const scoreDisplay = s.total ? `${s.score} / ${s.total}` : s.score;

    return `
      <tr class="${rowClass}">
        <td class="rank-cell">${rankIcon}</td>
        <td class="name-cell">${esc(s.name)}</td>
        <td class="email-cell">${esc(s.email)}</td>
        <td class="mobile-cell">${esc(s.mobile)}</td>
        <td class="score-cell">${scoreDisplay}</td>
        <td class="time-cell">${timeStr}</td>
        <td class="warn-cell">${s.warnings > 0 ? `⚠ ${s.warnings}` : '—'}</td>
        <td class="date-cell">${dateStr}</td>
      </tr>`;
  }).join('');
}

// ── Helpers ────────────────────────────────────────────────
function formatTime(seconds) {
  if (!seconds) return '—';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

function formatDate(dateStr) {
  try {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  } catch { return dateStr; }
}

function esc(str) {
  return String(str || '—')
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function updateExportCounts() {
  const allCount  = document.getElementById('opt-all-count');
  const filtCount = document.getElementById('opt-filtered-count');
  if (allCount)  allCount.textContent  = `${allStudents.length} records`;
  if (filtCount) filtCount.textContent = filteredStudents.length !== allStudents.length
    ? `${filteredStudents.length} filtered records` : 'Current search view';
}

// ── Export Modal ───────────────────────────────────────────
function openExportMenu()  { updateExportCounts(); document.getElementById('export-modal').classList.add('open'); }
function closeExportMenu() { document.getElementById('export-modal').classList.remove('open'); }

document.getElementById('export-modal').addEventListener('click', function(e) {
  if (e.target === this) closeExportMenu();
});
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeExportMenu(); });