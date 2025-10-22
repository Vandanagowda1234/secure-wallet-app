import React, { useEffect, useState } from "react";
import { fetchBalance, depositEther } from "../../blockchain";

const DashboardPage = () => {
  const [balance, setBalance] = useState("0");

  const loadBalance = async () => {
    const bal = await fetchBalance();
    setBalance(bal);
  };

  const handleDeposit = async () => {
    const success = await depositEther("1"); // 1 ETH deposit
    if (success) {
      alert("Deposit successful!");
      loadBalance(); // Refresh balance
    } else {
      alert("Deposit failed.");
    }
  };

  useEffect(() => {
    loadBalance();
  }, []);

  return (
    <div>
      <h2>Dashboard</h2>
      <p>Wallet Balance: {balance} ETH</p>
      <button onClick={handleDeposit}>Deposit 1 ETH</button>
    </div>
  );
};

export default DashboardPage;
