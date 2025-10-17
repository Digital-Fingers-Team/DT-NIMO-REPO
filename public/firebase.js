// firebase.js
// Proper Firebase modular SDK wiring and helpers

// 1️⃣ Import Firebase SDK (ESM via CDN)
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  createUserWithEmailAndPassword,
  updateProfile
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import {
  getFirestore,
  collection,
  doc,
  addDoc,
  setDoc,
  updateDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-storage.js";

// 2️⃣ Firebase Config (allow override via window.firebaseConfigOverride)
const defaultConfig = {
  apiKey: "your-api-key-here",
  authDomain: "dt-edu-f94cb.firebaseapp.com",
  projectId: "dt-edu-f94cb",
  storageBucket: "dt-edu-f94cb.firebasestorage.app",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id",
  measurementId: "your-measurement-id"
};

const firebaseConfig = window.firebaseConfigOverride || defaultConfig;

// 3️⃣ Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// 4️⃣ Helpers
async function getIdToken() {
  const user = auth.currentUser;
  return user ? user.getIdToken() : null;
}

async function ensureUserProfile() {
  const user = auth.currentUser;
  if (!user) return null;
  const userRef = doc(db, 'users', user.uid);
  const snap = await getDoc(userRef);
  if (!snap.exists()) {
    const displayName = user.displayName || (user.email ? user.email.split('@')[0] : 'User');
    const profile = {
      displayName,
      role: 'student',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    await setDoc(userRef, profile, { merge: true });
    return profile;
  }
  return snap.data();
}

export {
  // Core
  app,
  auth,
  db,
  storage,
  // Auth
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  updateProfile,
  // Firestore
  collection,
  doc,
  addDoc,
  setDoc,
  updateDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  // Storage
  ref,
  uploadBytes,
  getDownloadURL,
  // Helpers
  getIdToken,
  ensureUserProfile
};
