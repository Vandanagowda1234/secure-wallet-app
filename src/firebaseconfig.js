// src/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// ✅ Replace these values with your actual Firebase project credentials
const firebaseConfig = {
  apiKey: "AIzaSyAxxxxxx", // 🔑 Your Firebase API key
  authDomain: "walletapp-a97d5.firebaseapp.com",
  projectId: "walletapp-a97d5",
  storageBucket: "walletapp-a97d5.appspot.com",
  messagingSenderId: "581230224931",
  appId: "1:581230224931:web:abcd1234efgh5678",
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);

// ✅ Export Firestore instance
export const db = getFirestore(app);

export default app;
