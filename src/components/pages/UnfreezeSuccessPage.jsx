import React from "react";
import { useNavigate } from "react-router-dom";

export default function UnfreezeSuccessPage() {
  const navigate = useNavigate();

  const handleStartChallenge = () => {
    // 👇 go to the main ZKP Challenge page (not the form)
    navigate("/zkp-challenge");
  };

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h2>✅ Account Unfrozen Successfully!</h2>
      <p>You can now proceed with your Zero Knowledge Challenge 🔐</p>
      <button
        onClick={handleStartChallenge}
        style={{
          marginTop: "20px",
          padding: "10px 20px",
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
        }}
      >
        Start ZKP Challenge
      </button>
    </div>
  );
}
