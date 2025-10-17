// firebase.js

// 1️⃣ Import Firebase SDK (v11 ESM from CDN)
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  doc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  Timestamp
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-storage.js";

// 2️⃣ Firebase Config
const firebaseConfig = {
  apiKey: "your-api-key-here",
  authDomain: "dt-edu-f94cb.firebaseapp.com",
  projectId: "dt-edu-f94cb",
  storageBucket: "dt-edu-f94cb.firebasestorage.app",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id",
  measurementId: "your-measurement-id"
};

// 3️⃣ Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// 4️⃣ Export for use in other files
export {
  // Core
  app,
  auth,
  db,
  storage,
  // Auth
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  // Firestore
  collection,
  addDoc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  doc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  // Storage
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
};
