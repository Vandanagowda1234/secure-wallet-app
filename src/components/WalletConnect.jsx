import React, { useState } from "react";
import { ethers } from "ethers";
import contractAbi from "../yourcontractabi.json"; // make sure path is correct

const WalletConnect = () => {
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);

  const connectWallet = async () => {
    try {
      // Connect to local JSON-RPC (Remix VM)
      const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
      const accounts = await provider.listAccounts();
      if (accounts.length === 0) return alert("No accounts found.");

      const signer = provider.getSigner(accounts[0]);
      setAccount(accounts[0]);

      // Connect to your contract
      const contractAddress = "0xd9145CCE52D386f254917e481eB44e9943F39138";
      const verifierContract = new ethers.Contract(contractAddress, contractAbi, signer);
      setContract(verifierContract);

      console.log("Connected account:", accounts[0]);
      console.log("Contract connected:", verifierContract.address);
    } catch (error) {
      console.error("Connection failed:", error);
    }
  };

  return (
    <div className="p-4 bg-gray-100 rounded shadow-md max-w-md mx-auto mt-10">
      <h2 className="text-xl font-bold mb-4">Connect to Remix VM</h2>
      <button
        onClick={connectWallet}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        {account ? "Connected" : "Connect"}
      </button>
      {account && <p className="mt-4 text-gray-700">Account: {account}</p>}
    </div>
  );
};

export default WalletConnect;
