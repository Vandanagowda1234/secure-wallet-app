// src/components/pages/DashboardPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAccountData, getHistory } from "../../blockchain";

const DashboardPage = () => {
  const navigate = useNavigate();

  const [account, setAccount] = useState("");
  const [balance, setBalance] = useState(0);
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load account & balance on mount
  useEffect(() => {
    const loadData = async () => {
      const { account, balance } = await getAccountData();
      setAccount(account);
      setBalance(balance);

      const txHistory = await getHistory();
      setHistory(txHistory);
    };
    loadData();
  }, []);

  // ✅ Handle send button (redirect to ZKP challenge)
  const handleSend = async () => {
    if (!recipient || !amount) {
      alert("Enter recipient and amount");
      return;
    }

    try {
      // Optional validation
      if (!/^0x[a-fA-F0-9]{40}$/.test(recipient)) {
        alert("Enter a valid Ethereum address");
        return;
      }
      if (parseFloat(amount) <= 0) {
        alert("Amount must be greater than 0");
        return;
      }

      // Redirect to ZKP Challenge page
      navigate("/zkp-challenge", {
        state: {
          walletAddress: account,
          recipient,
          amount
        },
      });
    } catch (err) {
      console.error("Error in handleSend:", err);
      alert("An error occurred while initiating the transaction");
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h2>Dashboard</h2>
      <p><strong>Connected Account:</strong> {account}</p>
      <p><strong>Balance:</strong> {balance} ETH</p>

      <hr />
      <h3>Send Funds</h3>
      <div>
        <input
          type="text"
          placeholder="Recipient Address"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          style={{ width: "300px", marginRight: "10px" }}
        />
        <input
          type="number"
          placeholder="Amount in ETH"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          style={{ width: "150px", marginRight: "10px" }}
        />
        <button onClick={handleSend} disabled={loading}>
          {loading ? "Processing..." : "Send"}
        </button>
      </div>

      <hr />
      <h3>Transaction History</h3>
      {history.length === 0 ? (
        <p>No transactions yet.</p>
      ) : (
        <table border="1" cellPadding="5" style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>To</th>
              <th>Amount (ETH)</th>
              <th>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {history.map((tx, idx) => (
              <tr key={idx}>
                <td>{tx.to}</td>
                <td>{tx.amount}</td>
                <td>{tx.timestamp}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default DashboardPage;