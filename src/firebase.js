// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc, updateDoc, getDoc } from "firebase/firestore";

// Your Firebase config
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
const auth = getAuth(app);
const db = getFirestore(app);

/**
 * Register a new user in Firebase Auth + Firestore
 */
export async function registerUser(email, password, username, phone, zkpPin) {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  // Store user details in Firestore
  await setDoc(doc(db, "users", user.uid), {
    email,
    username,
    phone,
    zkpPin,
    frozen: false,
    createdAt: new Date()
  });

  return user;
}

/**
 * Freeze a user's account (after wrong ZKP attempt)
 */
export async function freezeUserAccount(userId) {
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      frozen: true,
      frozenAt: new Date(),
    });
    console.log("❌ Account frozen due to wrong ZKP!");
  } catch (err) {
    console.error("Failed to freeze account:", err);
  }
}

/**
 * Check if account is frozen
 */
export async function isAccountFrozen(userId) {
  try {
    const userSnap = await getDoc(doc(db, "users", userId));
    if (userSnap.exists()) {
      const data = userSnap.data();
      return data.frozen || false;
    }
    return false;
  } catch (err) {
    console.error("Failed to check frozen status:", err);
    return false;
  }
}

export { auth, db, signInWithEmailAndPassword };