# DDCET 2026 — Admin Dashboard

## Project Structure

```
ddcet-admin/
├── frontend/
│   ├── index.html              ← Login page
│   ├── dashboard.html          ← Admin dashboard
│   ├── css/
│   │   ├── login.css
│   │   └── dashboard.css
│   └── js/
│       ├── auth.js             ← Login + session guard
│       ├── dashboard.js        ← Stats, table render, logout
│       ├── search.js           ← Live filter by name/email/mobile
│       ├── leaderboard.js      ← Top 10 cards
│       └── export.js           ← TSV download + toast
└── backend/
    ├── firebase-config.js      ← Firebase init + live/offline status
    ├── realtime.js             ← Live Firebase listener (onValue)
    ├── db.js                   ← CRUD helpers + seed function
    └── database.rules.json     ← Firebase security rules
```

---

## Setup Guide

### Step 1 — Create Firebase Project
1. Go to https://console.firebase.google.com
2. Add project → name it (e.g. `ddcet-2026`) → Create

### Step 2 — Enable Realtime Database
1. Build → Realtime Database → Create Database
2. Choose region (e.g. `asia-southeast1` for India)
3. Start in Test mode

### Step 3 — Get Your Config
1. Project Settings → Your apps → Add Web App
2. Copy the firebaseConfig and paste into `backend/firebase-config.js`

### Step 4 — Apply Security Rules
1. Realtime Database → Rules tab
2. Paste contents of `backend/database.rules.json`
3. Click Publish

### Step 5 — Match Node Name
In `backend/realtime.js` update if needed:
```js
const FIREBASE_NODE = 'quiz_results';
```

### Step 6 — Admin Credentials
Edit in `frontend/js/auth.js`:
- Username: `admin`
- Password: `ddcet2026`

### Step 7 — Deploy to Netlify
- Publish directory: `frontend`

---

## Student Data Format

| Field      | Type   | Required | Notes                     |
|------------|--------|----------|---------------------------|
| name       | string | YES      | Full name                 |
| email      | string |          | Email address             |
| mobile     | string |          | Phone number              |
| score      | number | YES      | Marks (0-200)             |
| timeTaken  | number |          | Seconds to finish         |
| date       | string |          | ISO 8601 date string      |

Alternate field names are auto-resolved (e.g. `phone`, `marks`, `timestamp`).

---

## Console Utilities (open DevTools on dashboard)

```js
await seedTestData(15);             // Insert 15 fake records
await fetchAllResults();            // Read all once
await searchResults('arjun');       // Search by name/email/mobile
await getStats();                   // { total, highest, average, todayCount }
await updateResult(key, {score:95});// Update a field
await deleteResult(key);            // Delete one record
await deleteAllResults('DELETE_ALL'); // ⚠ Wipe everything
```