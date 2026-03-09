// ════════════════════════════════════════════════════════════
//  db.js  —  DDCET 2026 Admin Panel
//  DATABASE : Cloud Firestore
//  COLLECTION: "students"
//
//  Your Firestore fields:
//    email, mobile, name, score, timeUsed, timestamp, total, warnings
//
//  All functions are async — use with: await functionName()
//  Call from browser DevTools console on the dashboard page.
// ════════════════════════════════════════════════════════════

const DB_COLLECTION = 'students';

// ── READ ALL (one-time snapshot, sorted by score desc) ─────
/**
 * Fetch all student records once.
 * Returns array sorted highest score first.
 *
 * Usage: const all = await fetchAllResults();
 */
async function fetchAllResults() {
  const snap = await db.collection(DB_COLLECTION)
    .orderBy('score', 'desc')
    .get();

  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// ── READ ONE ───────────────────────────────────────────────
/**
 * Fetch a single student document by its Firestore ID.
 *
 * Usage: const s = await fetchResult('2IHYHRiLjriUABErPyfI');
 */
async function fetchResult(docId) {
  const doc = await db.collection(DB_COLLECTION).doc(docId).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() };
}

// ── WRITE (add new record) ─────────────────────────────────
/**
 * Add a new student result to Firestore.
 * Matches your existing field names exactly.
 *
 * Usage:
 *   await writeResult({
 *     name: 'Arjun Shah', email: 'a@b.com', mobile: '9876543210',
 *     score: 24, total: 30, timeUsed: 900, warnings: 0
 *   });
 */
async function writeResult(data) {
  if (!data.name) throw new Error('writeResult: name is required.');

  const record = {
    name:      String(data.name).trim(),
    email:     String(data.email    || '').trim().toLowerCase(),
    mobile:    String(data.mobile   || '').trim(),
    score:     Number(data.score)   || 0,
    total:     Number(data.total)   || 0,
    timeUsed:  Number(data.timeUsed)|| 0,
    warnings:  Number(data.warnings)|| 0,
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
  };

  const ref = await db.collection(DB_COLLECTION).add(record);
  console.log('[db] Written doc ID:', ref.id);
  return ref.id;
}

// ── UPDATE (partial field update) ─────────────────────────
/**
 * Update specific fields of an existing document.
 *
 * Usage: await updateResult('2IHYHRiLjriUABErPyfI', { score: 28 });
 */
async function updateResult(docId, patch) {
  if (!docId) throw new Error('updateResult: docId is required.');
  await db.collection(DB_COLLECTION).doc(docId).update(patch);
  console.log('[db] Updated:', docId, patch);
}

// ── DELETE ONE ─────────────────────────────────────────────
/**
 * Delete a single student document.
 *
 * Usage: await deleteResult('2IHYHRiLjriUABErPyfI');
 */
async function deleteResult(docId) {
  if (!docId) throw new Error('deleteResult: docId is required.');
  await db.collection(DB_COLLECTION).doc(docId).delete();
  console.log('[db] Deleted:', docId);
}

// ── DELETE ALL ─────────────────────────────────────────────
/**
 * ⚠ DANGER: Deletes every document in the students collection.
 * Must pass "DELETE_ALL" as confirmation string.
 *
 * Usage: await deleteAllResults('DELETE_ALL');
 */
async function deleteAllResults(confirm) {
  if (confirm !== 'DELETE_ALL') {
    throw new Error('Pass "DELETE_ALL" as confirmation to wipe all records.');
  }
  const snap = await db.collection(DB_COLLECTION).get();
  const batch = db.batch();
  snap.docs.forEach(doc => batch.delete(doc.ref));
  await batch.commit();
  console.warn('[db] ⚠ All student records deleted. Count:', snap.size);
}

// ── SEARCH (client-side) ───────────────────────────────────
/**
 * Search all records by name, email, or mobile.
 *
 * Usage: const results = await searchResults('karan');
 */
async function searchResults(query) {
  const all = await fetchAllResults();
  const q   = String(query).toLowerCase().trim();
  return all.filter(s =>
    (s.name   && s.name.toLowerCase().includes(q))  ||
    (s.email  && s.email.toLowerCase().includes(q)) ||
    (s.mobile && String(s.mobile).includes(q))
  );
}

// ── STATS SNAPSHOT ─────────────────────────────────────────
/**
 * Returns quick stats: total, highest, average, todayCount.
 *
 * Usage: const s = await getStats(); console.log(s);
 */
async function getStats() {
  const all   = await fetchAllResults();
  const today = new Date().toDateString();

  const total   = all.length;
  const highest = total ? Math.max(...all.map(r => r.score || 0)) : 0;
  const average = total
    ? Math.round(all.reduce((s, r) => s + (r.score || 0), 0) / total)
    : 0;

  const todayCount = all.filter(r => {
    try {
      // Handle Firestore Timestamp objects
      const d = r.timestamp?.toDate
        ? r.timestamp.toDate()
        : new Date(r.timestamp);
      return d.toDateString() === today;
    } catch { return false; }
  }).length;

  return { total, highest, average, todayCount };
}

// ── SEED TEST DATA (dev only) ──────────────────────────────
/**
 * Inserts N fake student records for testing the dashboard.
 * Call from browser console: await seedTestData(20)
 */
async function seedTestData(count = 10) {
  const names = [
    'Arjun Shah','Priya Patel','Ravi Kumar','Sneha Desai','Mohit Verma',
    'Ananya Singh','Kiran Mehta','Raj Gupta','Pooja Joshi','Amit Yadav',
    'Divya Nair','Siddharth Roy','Meera Bose','Vishal Sharma','Leela Iyer'
  ];
  const domains = ['gmail.com','yahoo.com','hotmail.com'];

  const batch = db.batch();

  for (let i = 0; i < count; i++) {
    const name    = names[i % names.length];
    const first   = name.split(' ')[0].toLowerCase();
    const total   = 30;
    const score   = Math.floor(Math.random() * 21) + 10; // 10–30
    const timeUsed = Math.floor(Math.random() * 2700) + 300; // 5–50 min
    const warnings = Math.floor(Math.random() * 4);

    const ref = db.collection(DB_COLLECTION).doc();
    batch.set(ref, {
      name,
      email:     `${first}${i}@${domains[i % domains.length]}`,
      mobile:    `9${Math.floor(Math.random() * 1e9).toString().padStart(9,'0')}`,
      score,
      total,
      timeUsed,
      warnings,
      timestamp: firebase.firestore.Timestamp.fromDate(
        new Date(Date.now() - Math.random() * 7 * 86400000)
      )
    });
  }

  await batch.commit();
  console.log(`[db] ✅ Seeded ${count} test student records.`);
}