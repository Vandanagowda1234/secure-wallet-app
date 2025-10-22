import { ethers } from "ethers";

// Replace with your deployed contract address from Remix
const CONTRACT_ADDRESS = "0xf8e81D47203A594245E36C48e151709F0C19fBe8";

// Minimal ABI for your SecureWallet contract
const CONTRACT_ABI = [
  "function deposit() external payable",
  "function getBalance() public view returns (uint256)",
  "event Deposit(address indexed sender, uint amount)"
];

// Connect to the VM provider (Remix injects the VM provider)
const provider = new ethers.providers.Web3Provider(window.ethereum || "http://localhost:8545"); 
const signer = provider.getSigner();
const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

export const fetchBalance = async () => {
  try {
    const balance = await contract.getBalance();
    return ethers.utils.formatEther(balance); // Convert wei → ETH
  } catch (err) {
    console.error("Error fetching balance:", err);
    return 0;
  }
};

export const depositEther = async (amount) => {
  try {
    const tx = await contract.deposit({ value: ethers.utils.parseEther(amount) });
    await tx.wait();
    return true;
  } catch (err) {
    console.error("Deposit failed:", err);
    return false;
  }
};
