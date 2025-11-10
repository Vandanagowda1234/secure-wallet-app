// ✅ src/components/pages/UnfreezeSuccessPage.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function UnfreezeSuccessPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/zkp-challenge");
    }, 3000); // ⏳ Redirect after 3 seconds

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div
      style={{
        textAlign: "center",
        marginTop: "100px",
        padding: "40px",
        background: "#f8f9fa",
        borderRadius: "12px",
        maxWidth: "500px",
        margin: "auto",
        boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
      }}
    >
      <h2 style={{ color: "#28a745" }}>✅ Account Unfrozen!</h2>
      <p>Your account has been successfully verified.</p>
      <p>Redirecting you to the ZKP Challenge page...</p>
    </div>
  );
}