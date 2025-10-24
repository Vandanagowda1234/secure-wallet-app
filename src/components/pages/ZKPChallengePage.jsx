// src/components/pages/ZKPChallengePage.jsx
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function ZKPChallengePage() {
  const navigate = useNavigate();
  const location = useLocation();

  const { walletAddress, recipient, amount } = location.state;

  const [answers, setAnswers] = useState(["", "", "", ""]);
  const [message, setMessage] = useState("");

  const handleChange = (idx, value) => {
    const newAnswers = [...answers];
    newAnswers[idx] = value;
    setAnswers(newAnswers);
  };

  const handleVerify = async () => {
    // For demo, simulate ZKP verification success
    const verificationSuccess = true;

    if (verificationSuccess) {
      setMessage("✅ ZKP verified successfully!");

      // --- Update transaction history and balances ---
      const storedHistory = JSON.parse(localStorage.getItem("txHistory")) || [];
      const timestamp = new Date().toLocaleString();

      // Add new transaction
      storedHistory.push({
        sender: walletAddress,
        recipient,
        amount,
        timestamp,
      });
      localStorage.setItem("txHistory", JSON.stringify(storedHistory));

      // Update balances for sender and recipient
      const storedAccounts = JSON.parse(localStorage.getItem("accounts")) || [];
      const updatedAccounts = storedAccounts.map(acc => {
        if (acc.address === walletAddress) {
          return { ...acc, balance: parseFloat(acc.balance) - parseFloat(amount) };
        }
        if (acc.address === recipient) {
          return { ...acc, balance: parseFloat(acc.balance) + parseFloat(amount) };
        }
        return acc;
      });
      localStorage.setItem("accounts", JSON.stringify(updatedAccounts));

      // Redirect to Transaction Success page after 1 second
      setTimeout(() => {
        navigate("/transaction-success", {
          state: {
            sender: walletAddress,
            recipient,
            amount,
            timestamp,
          },
        });
      }, 1000);
    } else {
      setMessage("❌ ZKP verification failed. Try again.");
    }
  };

  return (
    <div className="zkp-page" style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h2>Zero Knowledge Challenge</h2>
      <ol>
        <li>
          Sum of 1st and 3rd numbers:
          <input
            type="number"
            value={answers[0]}
            onChange={(e) => handleChange(0, e.target.value)}
          />
        </li>
        <li>
          Sum of previous answer + 2nd number:
          <input
            type="number"
            value={answers[1]}
            onChange={(e) => handleChange(1, e.target.value)}
          />
        </li>
        <li>
          Product of 1st and 4th numbers:
          <input
            type="number"
            value={answers[2]}
            onChange={(e) => handleChange(2, e.target.value)}
          />
        </li>
        <li>
          Difference between 3rd and 1st numbers:
          <input
            type="number"
            value={answers[3]}
            onChange={(e) => handleChange(3, e.target.value)}
          />
        </li>
      </ol>

      <button onClick={handleVerify}>Verify Proof & Send</button>

      {message && <p>{message}</p>}
    </div>
  );
}