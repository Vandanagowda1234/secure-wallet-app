import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAccountData } from "../../blockchain";

const DashboardPage = () => {
  const navigate = useNavigate();

  const [account, setAccount] = useState("");
  const [balance, setBalance] = useState(0);
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [availableAccounts, setAvailableAccounts] = useState([]);

  // ✅ List of available Ganache accounts
  const ganacheAccounts = [
    { label: "vandhana", address: "0x9DcAf0157Cb9505cdc7dE5B22046DF1889f6074F", balance: 1000 },
    { label: "panchami", address: "0x905B379Be566f84c846C40a3fD6DaaabE7878C13", balance: 1000 },
    { label: "greeshma", address: "0x05Af25Fa9dB95aB38DF092211c3A4FCe17927190", balance: 1000 },
    { label: "ananya", address: "0x29f4c59BE97D3e13795b0F69791eEC414C1BEcE2", balance: 1000 },
    { label: "Account 4", address: "0xE811ECB3c4F2A5174fb25541DC2974393063C6B8", balance: 1000 },
    { label: "Account 5", address: "0x8D66B0E0402D79d90F5c705ef14DFC16bfA673A1", balance: 1000 },
    { label: "Account 6", address: "0xda356c12510f94a436271441601bb2c4836F4295", balance: 1000 },
    { label: "Account 7", address: "0x0116554B505e9f1d0E93608995DA937002d3f254", balance: 1000 },
    { label: "Account 8", address: "0xDEAFE61ACB49bB8A99d7a58a95a9B0103C578EbD", balance: 1000 },
    { label: "Account 9", address: "0xA714F64aC60c73D261eEDcafE2014d11Dc849833", balance: 1000 },
  ];

  // ✅ Initialize localStorage accounts if not present
  useEffect(() => {
    if (!localStorage.getItem("accounts")) {
      localStorage.setItem("accounts", JSON.stringify(ganacheAccounts));
    }
  }, []);

  // ✅ Load account, balance, and history on mount and whenever a transaction occurs
  useEffect(() => {
    const loadData = async () => {
      const storedAccounts = JSON.parse(localStorage.getItem("accounts")) || ganacheAccounts;
      const connectedAccount = storedAccounts.find(acc => acc.address === account) || storedAccounts[1];

      setAccount(connectedAccount.address);
      setBalance(parseFloat(connectedAccount.balance));

      const txHistory = JSON.parse(localStorage.getItem("txHistory")) || [];
      setHistory(txHistory);

      setAvailableAccounts(storedAccounts);
    };
    loadData();
  }, [account]); // will reload balances and history after account updates

  // ✅ Handle send button (redirect to ZKP challenge)
  const handleSend = async () => {
    if (!recipient || !amount) {
      alert("Enter recipient and amount");
      return;
    }

    try {
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
          amount,
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

      <div style={{ marginBottom: "10px" }}>
        <label><strong>Select Recipient:</strong></label><br />
        <select
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          style={{ width: "470px", marginRight: "10px", padding: "6px" }}
        >
          <option value="">-- Select Recipient Account --</option>
          {availableAccounts
            .filter(acc => acc.address !== account) // Don't show sender itself
            .map((acc, idx) => (
              <option key={idx} value={acc.address}>
                {acc.label} ({acc.address})
              </option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: "10px" }}>
        <input
          type="number"
          placeholder="Amount in ETH"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          style={{ width: "200px", marginRight: "10px", padding: "6px" }}
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
              <th>Sender</th>
              <th>Recipient</th>
              <th>Amount (ETH)</th>
              <th>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {history.map((tx, idx) => (
              <tr key={idx}>
                <td>{tx.sender}</td>
                <td>{tx.recipient}</td>
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