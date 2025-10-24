// -------------------------
// Imports & Setup
// -------------------------
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

// -------------------------
// Firebase (Client SDK)
// -------------------------
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";

// Your Firebase web config (get this from Firebase Console → Project Settings → General)
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

// -------------------------
// Express Setup
// -------------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// -------------------------
// Picture Password Routes
// -------------------------
app.post("/api/register-picture-password", async (req, res) => {
  try {
    const { userId, selectedPics } = req.body;
    if (!userId || !selectedPics) {
      return res.status(400).json({ success: false, message: "Missing data" });
    }

    const hashedPattern = Buffer.from(selectedPics.join("-")).toString("base64");

    await setDoc(
      doc(db, "users", userId),
      {
        picturePassword: hashedPattern,
        updatedAt: new Date(),
      },
      { merge: true }
    );

    res.json({ success: true, message: "Picture password saved!" });
  } catch (error) {
    console.error("❌ Error saving picture password:", error);
    res.status(500).json({ success: false, message: "Error saving password" });
  }
});

// -------------------------
// Start Server
// -------------------------
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
