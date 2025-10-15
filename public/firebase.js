// firebase.js

// 1️⃣ Import Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut, signInAnonymously } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, query, where, doc, setDoc, onSnapshot, orderBy, limit, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-storage.js";

// 2️⃣ Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyCPLU5MPZbNqUEBauKPWn8ui4eZUSzZf8s",
  authDomain: "dt-edu-1d5ad.firebaseapp.com",
  projectId: "dt-edu-1d5ad",
  storageBucket: "dt-edu-1d5ad.firebasestorage.app",
  messagingSenderId: "116202003139",
  appId: "1:116202003139:web:9b6378faf2adf1e942a076",
  measurementId: "G-Q3TSMV8QL1"
};

// 3️⃣ Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// 4️⃣ Export for use in other files
export {
  auth,
  db,
  storage,
  // auth
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  signInAnonymously,
  // firestore
  collection,
  addDoc,
  getDocs,
  query,
  where,
  doc,
  setDoc,
  onSnapshot,
  orderBy,
  limit,
  serverTimestamp,
  // storage
  ref,
  uploadBytes,
  getDownloadURL
};
