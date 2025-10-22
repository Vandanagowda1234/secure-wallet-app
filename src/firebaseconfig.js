// src/firebaseConfig.js
// Firebase v9+ Modular SDK

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Replace these values with your Firebase project config
const firebaseConfig = {
  apiKey: "AIzaSyAArPdKW7uuaO7wFtRocxB_mxG495OcXCg",
  authDomain: "cyber-shield--ai.firebaseapp.com",
  projectId: "cyber-shield--ai",
  storageBucket: "cyber-shield--ai.firebasestorage.app",
  messagingSenderId: "935467340315",
  appId: "1:935467340315:web:7ac3e4cf3e168f7dc31ebe",
  measurementId: "G-7QN8HF15QZ"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Firestore and Auth
export const db = getFirestore(app);
export const auth = getAuth(app);
