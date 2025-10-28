// src/components/pages/LoginPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { checkIfPhoneExists } from "../../firebase"; // Firestore check function

const LoginPage = () => {
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // ✅ Step 1 — Check if user exists and send OTP
  const handleSendOtp = async () => {
    setError("");
    setMessage("");

    if (!phone.trim()) {
      setError("Please enter your phone number.");
      return;
    }

    setLoading(true);
    try {
      const userData = await checkIfPhoneExists(phone);

      if (!userData) {
        setError("This phone number is not registered. Redirecting to Register...");
        setTimeout(() => navigate("/register"), 2000);
        return;
      }

      // ✅ Simulate OTP send (for testing)
      setTimeout(() => {
        console.log(`📱 Dev Mode: OTP sent to ${phone}: 1234`);
        setMessage("OTP sent successfully! (Use 1234 for testing)");
        setOtpSent(true);
        setLoading(false);
      }, 800);
    } catch (err) {
      console.error("Error checking phone:", err);
      setError("Failed to verify phone number. Try again later.");
      setLoading(false);
    }
  };

  // ✅ Step 2 — Verify OTP and save Firestore userId
  const handleVerifyOtp = async () => {
    setError("");
    setMessage("");

    if (otp !== "1234") {
      setError("❌ Invalid OTP. Please try again.");
      return;
    }

    setMessage("Login successful! Redirecting...");
    try {
      const userData = await checkIfPhoneExists(phone);

      if (userData && userData.id) {
        // ✅ Save userId in session & local storage
        sessionStorage.setItem("userId", userData.id);
        localStorage.setItem("userId", userData.id);

        console.log(`✅ Logged in as: ${userData.username || "User"} (${userData.id})`);
        setTimeout(() => navigate("/biometric"), 1200);
      } else {
        console.error("No user ID found in Firestore data.");
        setError("User ID missing in Firestore. Please try again.");
      }
    } catch (err) {
      console.error("Error verifying user:", err);
      setError("Failed to log in. Try again later.");
    }
  };

  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #1e1e2f, #2c2c54)",
        color: "#fff",
        fontFamily: "Poppins, sans-serif",
      }}
    >
      <div
        style={{
          background: "#2a2a40",
          padding: "40px",
          borderRadius: "16px",
          boxShadow: "0 0 20px rgba(0, 0, 0, 0.3)",
          width: "100%",
          maxWidth: "420px",
        }}
      >
        <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
          Login with Phone & OTP 📲
        </h2>

        <input
          type="tel"
          placeholder="Enter Phone Number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          style={inputStyle}
        />

        <button
          onClick={handleSendOtp}
          disabled={loading || !phone || otpSent}
          style={{ ...buttonStyle, opacity: otpSent ? 0.6 : 1 }}
        >
          {loading ? "Sending OTP..." : "Send OTP"}
        </button>

        {otpSent && (
          <>
            <input
              type="number"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              style={inputStyle}
            />
            <button
              onClick={handleVerifyOtp}
              disabled={loading || !otp}
              style={buttonStyle}
            >
              Verify OTP
            </button>
          </>
        )}

        {message && (
          <p style={{ color: "#32CD32", textAlign: "center", marginTop: "15px" }}>
            {message}
          </p>
        )}
        {error && (
          <p style={{ color: "tomato", textAlign: "center", marginTop: "15px" }}>
            {error}
          </p>
        )}

        <p style={{ marginTop: "25px", textAlign: "center" }}>
          New user?{" "}
          <span
            style={{ color: "#1e90ff", cursor: "pointer", fontWeight: "bold" }}
            onClick={() => navigate("/register")}
          >
            Register here
          </span>
        </p>
      </div>
    </div>
  );
};

// 🎨 Styles
const inputStyle = {
  display: "block",
  width: "100%",
  marginBottom: "12px",
  padding: "12px",
  borderRadius: "8px",
  border: "1px solid #444",
  background: "#3a3a5a",
  color: "#fff",
  fontSize: "16px",
  outline: "none",
};

const buttonStyle = {
  background: "#1e90ff",
  color: "#fff",
  border: "none",
  padding: "12px 20px",
  borderRadius: "8px",
  cursor: "pointer",
  marginTop: "10px",
  width: "100%",
  fontWeight: "600",
  fontSize: "16px",
  transition: "background 0.2s",
};

export default LoginPage;
