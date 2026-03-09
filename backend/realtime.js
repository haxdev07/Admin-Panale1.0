// ════════════════════════════════════════════════════════════
//  realtime.js  —  DDCET 2026 Admin Panel
//  DATABASE : Cloud Firestore
//  COLLECTION: "students"  (matches your Firestore structure)
//
//  Your Firestore fields (from your screenshot):
//    email, mobile, name, score, timeUsed, timestamp, total, warnings
// ════════════════════════════════════════════════════════════

const COLLECTION = 'students';

// ── Normalize a Firestore document into a standard student object ──
function normaliseStudent(docId, data) {
  // Handle Firestore Timestamp objects and plain values for the date
  let dateValue = null;
  if (data.timestamp) {
    if (typeof data.timestamp.toDate === 'function') {
      // Firestore Timestamp → JS Date → ISO string
      dateValue = data.timestamp.toDate().toISOString();
    } else {
      dateValue = data.timestamp;
    }
  }

  return {
    id:       docId,
    name:     String(data.name     || 'Unknown'),
    email:    String(data.email    || ''),
    mobile:   String(data.mobile   || ''),
    score:    Number(data.score)   || 0,
    total:    Number(data.total)   || 0,       // total questions
    timeUsed: Number(data.timeUsed)|| 0,       // seconds used (your field name)
    warnings: Number(data.warnings)|| 0,
    date:     dateValue
  };
}

// ── Live listener — fires on every Firestore change ────────
function initRealtimeListener() {
  const colRef = db.collection(COLLECTION);

  // onSnapshot = real-time listener (fires immediately + on every change)
  colRef.onSnapshot(
    (snapshot) => {
      const students = [];

      snapshot.forEach((doc) => {
        students.push(normaliseStudent(doc.id, doc.data()));
      });

      // Hand off to dashboard.js → onDataUpdate()
      if (typeof onDataUpdate === 'function') {
        onDataUpdate(students);
      }

      // Update live pill color based on Firestore status
      updateLivePill(true);
    },

    (error) => {
      console.error('[DDCET realtime] Firestore error:', error.code, error.message);
      updateLivePill(false);

      const tbody = document.getElementById('table-body');
      if (tbody) {
        const msg = error.code === 'permission-denied'
          ? 'Permission denied. Check your Firestore security rules.'
          : `Firestore error: ${error.message}`;

        tbody.innerHTML = `
          <tr>
            <td colspan="7" class="table-empty">
              <div class="error-state">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" stroke-width="1.5">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <span>${msg}</span>
                <small style="font-size:0.65rem;opacity:0.6">Check browser console for details</small>
              </div>
            </td>
          </tr>`;
      }
    }
  );
}

// ── Update the LIVE pill in the navbar ─────────────────────
function updateLivePill(isOnline) {
  const pill = document.getElementById('live-pill');
  if (!pill) return;
  const dot  = pill.querySelector('.live-dot');
  const label = pill.querySelector('span:last-child');

  if (isOnline) {
    pill.style.background   = '#f0fdf4';
    pill.style.borderColor  = '#bbf7d0';
    pill.style.color        = '#16a34a';
    if (dot)   dot.style.background = '#16a34a';
    if (label) label.textContent    = 'LIVE';
  } else {
    pill.style.background   = '#fafafa';
    pill.style.borderColor  = '#e5e5e5';
    pill.style.color        = '#a0968a';
    if (dot)   dot.style.background = '#a0968a';
    if (label) label.textContent    = 'OFFLINE';
  }
}

// ── Detach listener on logout ──────────────────────────────
let _unsubscribe = null;

function initRealtimeListenerWithCleanup() {
  const colRef = db.collection(COLLECTION);

  _unsubscribe = colRef.onSnapshot(
    (snapshot) => {
      const students = [];
      snapshot.forEach((doc) => {
        students.push(normaliseStudent(doc.id, doc.data()));
      });
      if (typeof onDataUpdate === 'function') onDataUpdate(students);
      updateLivePill(true);
    },
    (error) => {
      console.error('[DDCET] Firestore error:', error.message);
      updateLivePill(false);
    }
  );
}

function detachRealtimeListener() {
  if (_unsubscribe) {
    _unsubscribe();
    _unsubscribe = null;
    console.log('[DDCET] Firestore listener detached.');
  }
}

// ── Auto-start on page load ────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(initRealtimeListenerWithCleanup, 150);
});