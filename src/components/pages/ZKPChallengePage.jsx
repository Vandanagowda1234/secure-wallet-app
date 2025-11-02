// ✅ src/components/pages/ZKPChallengePage.jsx
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { db } from "../../firebase.js";
import {
  doc,
  getDoc,
  writeBatch,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  addDoc,
} from "firebase/firestore";

export default function ZKPChallengePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { walletAddress, recipient, amount } = location.state || {};

  const [answers, setAnswers] = useState(["", "", "", ""]);
  const [correctAnswers, setCorrectAnswers] = useState(null);
  const [message, setMessage] = useState("Loading ZKP data...");
  const [loading, setLoading] = useState(true);
  const [isAccountFrozen, setIsAccountFrozen] = useState(false);
  const [user, setUser] = useState(null);

  const userId = sessionStorage.getItem("userId");

  // ---------- LOAD USER ----------
  useEffect(() => {
    const fetchUser = async () => {
      if (!userId) {
        setMessage("User not logged in.");
        setLoading(false);
        return;
      }

      try {
        const userRef = doc(db, "users", userId);
        const docSnap = await getDoc(userRef);

        if (!docSnap.exists()) {
          setMessage("User data not found in Firestore.");
          setLoading(false);
          return;
        }

        const data = docSnap.data();
        setUser(data);

        if (data.isFrozen) {
          setMessage("🔴 Account frozen due to prior failed verification.");
          setIsAccountFrozen(true);
          setLoading(false);
          return;
        }

        const pin = data.zkpPIN || data.zkpPin || "";
        if (!pin || !/^\d{4}$/.test(pin)) {
          setMessage("Invalid or missing 4-digit ZKP PIN.");
          setLoading(false);
          return;
        }

        calculateZkpAnswers(pin);
      } catch (err) {
        console.error("Error fetching user:", err);
        setMessage("Error loading user data.");
      } finally {
        setLoading(false);
      }
    };

    const calculateZkpAnswers = (pin) => {
      const P1 = parseInt(pin[0]);
      const P2 = parseInt(pin[1]);
      const P3 = parseInt(pin[2]);
      const P4 = parseInt(pin[3]);

      const Q1 = P1 + P3;
      const Q2 = Q1 + P2;
      const Q3 = P1 * P4;
      const Q4 = P3 - P1;

      setCorrectAnswers([
        Q1.toString(),
        Q2.toString(),
        Q3.toString(),
        Q4.toString(),
      ]);
      setMessage("Enter answers for the ZKP challenge below.");
    };

    fetchUser();
  }, [userId]);

  // ---------- INPUT ----------
  const handleChange = (index, value) => {
    if (isAccountFrozen) return;
    const updated = [...answers];
    updated[index] = value;
    setAnswers(updated);
  };

  // ---------- VERIFY ----------
  const handleVerify = async () => {
    if (isAccountFrozen || !correctAnswers) return;

    setMessage("Verifying your Zero Knowledge Proof...");
    setLoading(true);

    const trimmed = answers.map((a) => a.trim());
    const success = trimmed.every((ans, i) => ans === correctAnswers[i]);

    if (!success) {
      setMessage("❌ ZKP verification failed. Account frozen for security.");
      setAnswers(["", "", "", ""]);
      setIsAccountFrozen(true);

      try {
        const userRef = doc(db, "users", userId);
        await updateDoc(userRef, { isFrozen: true });
      } catch (err) {
        console.error("Error freezing account:", err);
      }

      setLoading(false);
      return;
    }

    // ✅ Success: Proceed with Transaction
    try {
      const batch = writeBatch(db);
      const accountsRef = collection(db, "accounts");

      // ✅ Use user's wallet or fallback
      let senderWallet = walletAddress || user?.walletAddress || null;
      if (!senderWallet) {
        senderWallet = "0x12345"; // fallback wallet
        console.warn("⚠️ Using fallback wallet 0x12345");
      }

      // 🔍 Check if sender exists, else create
      let senderSnap = await getDocs(
        query(accountsRef, where("address", "==", senderWallet))
      );
      if (senderSnap.empty) {
        console.warn("⚠️ Sender wallet not found — creating new account");
        await addDoc(accountsRef, {
          address: senderWallet,
          balance: 5000, // default starting balance
        });
        senderSnap = await getDocs(
          query(accountsRef, where("address", "==", senderWallet))
        );
      }

      // 🔍 Check if recipient exists, else create
      let recipientSnap = await getDocs(
        query(accountsRef, where("address", "==", recipient))
      );
      if (recipientSnap.empty) {
        console.warn("⚠️ Recipient wallet not found — creating new account");
        await addDoc(accountsRef, { address: recipient, balance: 0 });
        recipientSnap = await getDocs(
          query(accountsRef, where("address", "==", recipient))
        );
      }

      // ✅ Fetch balances safely
      const senderDoc = senderSnap.docs[0];
      const recipientDoc = recipientSnap.docs[0];
      const senderBal = parseFloat(senderDoc.data().balance || 0);
      const recipientBal = parseFloat(recipientDoc.data().balance || 0);
      const transferAmount = parseFloat(amount || 0);

      if (isNaN(senderBal) || isNaN(recipientBal) || isNaN(transferAmount)) {
        throw new Error("Invalid number format in transaction fields.");
      }

      if (senderBal < transferAmount)
        throw new Error("Insufficient funds in sender account.");

      // ✅ Safe arithmetic
      batch.update(senderDoc.ref, {
        balance: (senderBal - transferAmount).toFixed(2),
      });
      batch.update(recipientDoc.ref, {
        balance: (recipientBal + transferAmount).toFixed(2),
      });

      await batch.commit();

      // ✅ Update user record + transaction history
      await updateDoc(doc(db, "users", userId), {
        lastTransaction: new Date().toISOString(),
      });

      await addDoc(collection(db, "users", userId, "transactions"), {
        sender: senderWallet,
        recipient,
        amount: transferAmount,
        verifiedOn: new Date().toISOString(),
        status: "success",
      });

      setMessage("✅ ZKP Verified! Transaction successful.");

      setTimeout(() => {
        navigate("/transaction-success", {
          state: { sender: senderWallet, recipient, amount: transferAmount },
        });
      }, 1500);
    } catch (err) {
      console.error("❌ Transaction error:", err);
      setMessage("❌ Transaction failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // ---------- UI ----------
  return (
    <div
      style={{
        padding: "40px",
        maxWidth: "500px",
        margin: "50px auto",
        background: "#fff",
        borderRadius: "12px",
        boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
        textAlign: "center",
      }}
    >
      <h2 style={{ color: "#007bff", marginBottom: "20px" }}>
        Zero Knowledge Challenge 🔐
      </h2>
      <p>{message}</p>

      {!loading && !isAccountFrozen && correctAnswers && (
        <>
          <ol style={{ textAlign: "left", paddingLeft: "30px" }}>
            <li>
              Sum of 1st and 3rd digits:
              <input
                type="number"
                value={answers[0]}
                onChange={(e) => handleChange(0, e.target.value)}
                style={inputStyle}
              />
            </li>
            <li>
              Previous answer + 2nd digit:
              <input
                type="number"
                value={answers[1]}
                onChange={(e) => handleChange(1, e.target.value)}
                style={inputStyle}
              />
            </li>
            <li>
              Product of 1st and 4th digits:
              <input
                type="number"
                value={answers[2]}
                onChange={(e) => handleChange(2, e.target.value)}
                style={inputStyle}
              />
            </li>
            <li>
              Difference between 3rd and 1st digits:
              <input
                type="number"
                value={answers[3]}
                onChange={(e) => handleChange(3, e.target.value)}
                style={inputStyle}
              />
            </li>
          </ol>

          <button
            onClick={handleVerify}
            disabled={loading || answers.some((a) => a === "")}
            style={buttonStyle}
          >
            {loading ? "Processing..." : "Verify & Proceed"}
          </button>
        </>
      )}

      {isAccountFrozen && (
        <p style={{ color: "red", marginTop: "20px" }}>
          🔒 Account frozen due to incorrect ZKP attempt. Contact admin to
          unfreeze.
        </p>
      )}
    </div>
  );
}

// ---------- Styles ----------
const inputStyle = {
  marginLeft: "15px",
  padding: "6px",
  borderRadius: "6px",
  border: "1px solid #ccc",
  width: "80px",
  textAlign: "center",
};

const buttonStyle = {
  marginTop: "20px",
  padding: "10px 25px",
  background: "#28a745",
  color: "#fff",
  border: "none",
  borderRadius: "8px",
  fontSize: "16px",
  fontWeight: "bold",
  cursor: "pointer",
};
