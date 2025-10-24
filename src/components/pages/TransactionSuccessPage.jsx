// src/components/pages/TransactionSuccessPage.jsx
import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function TransactionSuccessPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const { sender, recipient, amount, timestamp } = location.state || {};

  // Redirect back to dashboard after 4-5 seconds
  useEffect(() => {
    const timer = setTimeout(() => navigate("/dashboard"), 4000);
    return () => clearTimeout(timer);
  }, [navigate]);

  if (!location.state) {
    return <p>No transaction data available.</p>;
  }

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h2>✅ Transaction Successful!</h2>
      <p><strong>Sender:</strong> {sender}</p>
      <p><strong>Recipient:</strong> {recipient}</p>
      <p><strong>Amount:</strong> {amount} ETH</p>
      <p><strong>Timestamp:</strong> {timestamp}</p>
      <p>Redirecting back to Dashboard...</p>
    </div>
  );
}