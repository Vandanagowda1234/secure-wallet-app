// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithPhoneNumber } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";

// Firebase config
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

// -------------------- Auth Functions --------------------

// Register user with email & password
export async function registerUser(email, password, username, phone, zkpPin) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const userId = userCredential.user.uid;

    // Save extra info in Firestore
    await setDoc(doc(db, "users", userId), { username, phone, zkpPin });
    return { success: true, userId };
  } catch (err) {
    console.error("Registration error:", err);
    return { success: false, error: err.message };
  }
}

// Send OTP (demo mode, replace with actual phone verification if needed)
export async function sendOtp(phone) {
  try {
    // For dev/testing, we just return a static OTP
    const otp = "1234";
    console.log(`🧪 Dev Mode OTP sent to ${phone}: ${otp}`);
    return { success: true, otp };
  } catch (err) {
    console.error("OTP send error:", err);
    return { success: false, error: err.message };
  }
}

// -------------------- Picture Password --------------------

// Dummy hashing function
export function hashPicturePattern(selectedPics) {
  return selectedPics.join("-");
}

// Fetch stored picture password hash
export async function getPicturePasswordHash(userId) {
  try {
    const docSnap = await getDoc(doc(db, "users", userId));
    if (docSnap.exists()) {
      return docSnap.data().picturePassword || "";
    }
    return "";
  } catch (err) {
    console.error("Error fetching picture password:", err);
    return "";
  }
}

// Save picture password
export async function savePicturePassword(userId, selectedPics) {
  try {
    await setDoc(
      doc(db, "users", userId),
      { picturePassword: hashPicturePattern(selectedPics) },
      { merge: true }
    );
    return { success: true };
  } catch (err) {
    console.error("Error saving picture password:", err);
    return { success: false, error: err.message };
  }
}
