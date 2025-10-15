// firebase.js

// 1️⃣ Import Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, query, where } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-storage.js";

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
    auth, 
    db, 
    storage, 
    signInWithEmailAndPassword, 
    onAuthStateChanged, 
    signOut, 
    collection, 
    addDoc, 
    getDocs, 
    query, 
    where, 
    ref, 
    uploadBytes, 
    getDownloadURL,
    // Additional exports for real-time features
    onSnapshot: (query, callback) => {
        // Real-time listener for Firestore
        return query.onSnapshot ? query.onSnapshot(callback) : null;
    },
    serverTimestamp: () => {
        // Server timestamp for Firestore
        return new Date();
    },
    orderBy: (field, direction = 'asc') => {
        // Order by for queries
        return { field, direction };
    }
};
