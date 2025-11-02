import React, { useState, useEffect } from "react";
import { db } from "../../firebase";
import { collection, query, orderBy, getDocs } from "firebase/firestore";

export default function TransactionHistoryPage() {
  const [transactions, setTransactions] = useState([]);
  const userId = sessionStorage.getItem("userId");

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!userId) return;
      try {
        const q = query(
          collection(db, "users", userId, "transactions"),
          orderBy("timestamp", "desc")
        );
        const snap = await getDocs(q);
        const txs = snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTransactions(txs);
      } catch (err) {
        console.error("Error fetching transactions:", err);
      }
    };

    fetchTransactions();
  }, [userId]);

  return (
    <div style={{ padding: "40px", maxWidth: "800px", margin: "auto" }}>
      <h2 style={{ color: "#007bff" }}>Transaction History</h2>
      {transactions.length === 0 ? (
        <p>No transactions found.</p>
      ) : (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginTop: "20px",
          }}
        >
          <thead>
            <tr style={{ background: "#f1f1f1" }}>
              <th>Sender</th>
              <th>Recipient</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((txn) => (
              <tr key={txn.id}>
                <td>{txn.sender}</td>
                <td>{txn.recipient}</td>
                <td>{txn.amount}</td>
                <td>{txn.status}</td>
                <td>
                  {txn.timestamp?.toDate
                    ? txn.timestamp.toDate().toLocaleString()
                    : "Pending..."}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
