// src/firebase.js
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
} from "firebase/firestore";

// ✅ Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAxxxxxx", // replace with your real API key
  authDomain: "walletapp-a97d5.firebaseapp.com",
  projectId: "walletapp-a97d5",
  storageBucket: "walletapp-a97d5.appspot.com",
  messagingSenderId: "581230224931",
  appId: "1:581230224931:web:abcd1234efgh5678",
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

//
// ─── REGISTER USER ─────────────────────────────────────────────
//
export const registerUser = async (email, password, username, phone, zkpPin) => {
  try {
    const userRef = doc(db, "users", phone);
    const userData = {
      email,
      password, // ⚠️ for demo purposes only
      username,
      phone,
      zkpPin,
      createdAt: new Date().toISOString(),
      isFrozen: false,
      picturePassword: [],
    };

    await setDoc(userRef, userData);
    console.log("✅ User registered:", userData);
    return { uid: phone };
  } catch (error) {
    console.error("🔥 Registration error:", error);
    throw error;
  }
};

//
// ─── CHECK IF PHONE EXISTS ─────────────────────────────────────
//
export const checkIfPhoneExists = async (phone) => {
  try {
    const userRef = doc(db, "users", phone);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const data = userSnap.data();
      console.log("📱 User found:", data);
      return { id: phone, ...data };
    } else {
      console.warn("❌ No user found for phone:", phone);
      return null;
    }
  } catch (error) {
    console.error("❌ Firestore phone check failed:", error);
    throw new Error("phone-check-failed");
  }
};

//
// ─── SAVE PICTURE PASSWORD ─────────────────────────────────────
//
export const savePicturePassword = async (userId, imageUrls) => {
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, { picturePassword: imageUrls });
    console.log("🖼️ Picture password saved:", imageUrls);
    return true;
  } catch (error) {
    console.error("❌ Error saving picture password:", error);
    throw error;
  }
};

//
// ─── GET USER IMAGE DATA ───────────────────────────────────────
//
export const getUserImageData = async (userId) => {
  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    // ✅ Load static images (from public/images/)
    const allImages = [
      `${window.location.origin}/images/pic1.jpg`,
      `${window.location.origin}/images/pic2.jpg`,
      `${window.location.origin}/images/pic3.jpg`,
      `${window.location.origin}/images/pic4.jpg`,
      `${window.location.origin}/images/pic5.jpg`,
      `${window.location.origin}/images/pic6.jpg`,
    ];

    if (!userSnap.exists()) {
      console.warn("⚠️ No user found for ID:", userId);
      return { allImages, savedPassword: [] };
    }

    const data = userSnap.data();
    const savedPassword = data.picturePassword || [];
    console.log("🎯 Retrieved user image data:", { allImages, savedPassword });

    return { allImages, savedPassword };
  } catch (error) {
    console.error("❌ Error fetching user image data:", error);
    return { allImages: [], savedPassword: [] };
  }
};
