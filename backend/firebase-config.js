// ════════════════════════════════════════════════════════════
//  firebase-config.js  —  DDCET 2026 Admin Panel
//  DATABASE: Cloud Firestore (NOT Realtime Database)
//
//  HOW TO FILL IN YOUR VALUES:
//    Firebase Console → Project Settings → Your Apps → Web App
//    → SDK setup and configuration → Config
// ════════════════════════════════════════════════════════════

const firebaseConfig = {
  apiKey: "AIzaSyAviYdBxdwSlk_CTqwkY5_YbOeh8UtD3zg",
  authDomain: "ddcet-quiz-c2906.firebaseapp.com",
  projectId: "ddcet-quiz-c2906",
  storageBucket: "ddcet-quiz-c2906.firebasestorage.app",
  messagingSenderId: "665589713341",
  appId: "1:665589713341:web:b7e23359f1e0046259aad4",
  measurementId: "G-HJHGMZ6HMD"
};

// ── Initialize Firebase (safe: won't double-init) ──────────
if (!firebase.apps || firebase.apps.length === 0) {
  firebase.initializeApp(firebaseConfig);
}

// ── Global Firestore reference used by realtime.js & db.js ──
const db = firebase.firestore();

// ── Optional: enable offline persistence for better UX ─────
db.enablePersistence({ synchronizeTabs: true })
  .catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('[Firebase] Multiple tabs open — persistence disabled.');
    } else if (err.code === 'unimplemented') {
      console.warn('[Firebase] Offline persistence not supported in this browser.');
    }
  });