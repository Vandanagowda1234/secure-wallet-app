// server.js
import express from "express";
import nodemailer from "nodemailer";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, updateDoc } from "firebase/firestore";

const app = express();
app.use(express.json());

// ---------- Firebase Config ----------
const firebaseConfig = {
  apiKey: "AIzaSyAxxxxxx",
  authDomain: "walletapp-a97d5.firebaseapp.com",
  projectId: "walletapp-a97d5",
};
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

// ---------- Gmail Transporter ----------
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "vandanagowda86@gmail.com",
    pass: "fhbi akju pvgp fitk", // Gmail App Password
  },
});

// ---------- CORS helper ----------
const setCors = (res) => {
  res.setHeader("Access-Control-Allow-Origin", "*"); // allow all origins (can restrict later)
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
};

// ---------- OPTIONS preflight ----------
app.options("/send-unfreeze-email", (req, res) => {
  setCors(res);
  res.status(200).end();
});

app.options("/unfreeze/:userId", (req, res) => {
  setCors(res);
  res.status(200).end();
});

// ---------- POST send-unfreeze-email ----------
app.post("/send-unfreeze-email", async (req, res) => {
  setCors(res);

  const { email, userId } = req.body;
  if (!email || !userId)
    return res.status(400).json({ success: false, error: "Missing email or userId" });

  try {
    const verifyLink = `https://secure-blockchain-transaction-mvnhphsx5.vercel.app/unfreeze/${userId}`;

    await transporter.sendMail({
      from: '"Secure Wallet App" <vandanagowda86@gmail.com>',
      to: email,
      subject: "Unfreeze Your Secure Wallet Account",
      html: `
        <p>Your account was temporarily frozen due to a failed ZKP verification.</p>
        <p>Click below to securely unfreeze your account:</p>
        <a href="${verifyLink}" target="_blank" style="padding:10px 20px; background:#007bff; color:white; border-radius:5px; text-decoration:none;">Unfreeze My Account</a>
        <p>If you did not request this, ignore this email.</p>
      `,
    });

    res.json({ success: true });
  } catch (err) {
    console.error("Error sending email:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ---------- GET unfreeze/:userId ----------
app.get("/unfreeze/:userId", async (req, res) => {
  setCors(res);

  const { userId } = req.params;
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, { isFrozen: false });

    const redirectUrl = `https://secure-wallet-5bqhqgbod-vandanagowda86-4154s-projects.vercel.app/unfreeze-success`;
    res.redirect(redirectUrl);
  } catch (err) {
    console.error("Error unfreezing user:", err);
    res.status(500).send("Failed to unfreeze account.");
  }
});

// ---------- Start server locally ----------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
