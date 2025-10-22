// src/biometric.js
import React, { useState } from "react";

// ✅ Simple demo biometric scan component
export const BiometricScanComponent = ({ onSuccess }) => {
  const [status, setStatus] = useState("Place your finger...");

  const handleScan = () => {
    setStatus("Scanning...");
    setTimeout(() => {
      setStatus("✅ Biometric Verified!");
      onSuccess(); // trigger navigation when scan succeeds
    }, 2000);
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h2>🔐 Biometric Verification</h2>
      <p>{status}</p>
      <button onClick={handleScan} style={{ marginTop: "20px", padding: "10px 20px" }}>
        Start Scan
      </button>
    </div>
  );
};
