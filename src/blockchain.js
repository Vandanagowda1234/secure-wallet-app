// src/blockchain.js
import { ethers } from "ethers";

// Connect to local Ganache blockchain
const provider = new ethers.JsonRpcProvider("http://127.0.0.1:9545");
let signer;
let txHistory = [];

// ✅ Get account data (address + balance)
export const getAccountData = async () => {
  if (!signer) signer = await provider.getSigner(0);
  const account = signer.address;
  const balanceWei = await provider.getBalance(account);
  const balance = ethers.formatEther(balanceWei);
  return { account, balance };
};

// ✅ Send ETH transaction + update in-memory history
export const sendFunds = async (to, amount) => {
  if (!signer) signer = await provider.getSigner(0);
  const tx = await signer.sendTransaction({
    to,
    value: ethers.parseEther(amount),
  });
  await tx.wait();

  // Save transaction in memory
  txHistory.push({
    to,
    amount,
    timestamp: new Date().toLocaleString(),
  });
};

// ✅ Fetch transaction history
export const getHistory = async () => {
  return txHistory;
};

// ✅ Mock ZKP generation
export const generateZKP = async (sender, recipient, amount) => {
  console.log("🔐 Generating ZKP for:", sender, recipient, amount);
  return { proof: "mock-proof", publicSignals: [sender, recipient, amount] };
};

// ✅ Mock ZKP verification
export const verifyZKP = async (proof) => {
  console.log("🧾 Verifying proof:", proof);
  return true; // set to false to simulate failed verification
};

// ✅ Submit transaction after ZKP verification
export const submitZKPTransaction = async (walletAddress, recipient, amount) => {
  if (!signer) signer = await provider.getSigner(0);

  const tx = await signer.sendTransaction({
    to: recipient,
    value: ethers.parseEther(amount),
  });
  await tx.wait();

  // Update transaction history in memory
  txHistory.push({
    to: recipient,
    amount,
    timestamp: new Date().toLocaleString(),
  });

  console.log("✅ Transaction completed via ZKP for:", walletAddress);
  return tx;
};