// ── leaderboard.js — Top 10 Leaderboard Renderer ──

function renderLeaderboard(top10) {
  const container = document.getElementById('leaderboard-container');
  const countEl   = document.getElementById('lb-count');

  if (countEl) countEl.textContent = top10.length;

  if (!top10.length) {
    container.innerHTML = `
      <div style="padding:1.5rem; font-family:var(--mono); font-size:0.8rem; color:var(--muted2);">
        No data yet. Waiting for submissions…
      </div>`;
    return;
  }

  const medals = ['🥇', '🥈', '🥉'];

  container.innerHTML = top10.map((s, i) => {
    const rankClass = i < 3 ? `r${i + 1}` : '';
    const rankLabel = i < 3
      ? `<span class="lb-medal">${medals[i]}</span>`
      : `<span class="lb-rank-num">#${i + 1}</span>`;
    const firstName = (s.name || 'Unknown').split(' ')[0];

    return `
      <div class="lb-card ${rankClass}" title="${s.name || ''} — Score: ${s.score}">
        ${rankLabel}
        <div class="lb-score">${s.score ?? '—'}</div>
        <div class="lb-name">${esc(firstName)}</div>
      </div>`;
  }).join('');
}