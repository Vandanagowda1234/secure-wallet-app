import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser, checkIfPhoneExists } from "../../firebase";

const RegisterPage = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [zkpPin, setZkpPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!email || !password || !username || !phone || !zkpPin) {
      setError("All fields are required.");
      setLoading(false);
      return;
    }

    if (zkpPin.length !== 4 || isNaN(zkpPin)) {
      setError("ZKP PIN must be a 4-digit number.");
      setLoading(false);
      return;
    }

    try {
      const phoneExists = await checkIfPhoneExists(phone);
      if (phoneExists) {
        setError("This phone number is already registered. Please log in.");
        setLoading(false);
        return;
      }

      const user = await registerUser(email, password, username, phone, zkpPin);
      sessionStorage.setItem("userId", user.uid);

      alert("🎉 Registered successfully!");
      navigate("/setup-picture-password");
    } catch (err) {
      console.error("❌ Registration error:", err);
      setError("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #f5f7fa, #c3cfe2)",
      }}
    >
      <div
        style={{
          padding: "40px",
          background: "#fff",
          borderRadius: "12px",
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)",
          width: "100%",
          maxWidth: "420px",
        }}
      >
        <h2
          style={{
            textAlign: "center",
            color: "#1e90ff",
            marginBottom: "25px",
          }}
        >
          Account Registration 📜
        </h2>

        <form onSubmit={handleRegister}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
            required
          />
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={inputStyle}
            required
          />
          <input
            type="tel"
            placeholder="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            style={inputStyle}
            required
          />
          <input
            type="number"
            placeholder="4-Digit ZKP PIN"
            value={zkpPin}
            onChange={(e) => setZkpPin(e.target.value)}
            style={inputStyle}
            required
          />

          {error && (
            <p style={{ color: "tomato", textAlign: "center" }}>{error}</p>
          )}

          <button
            type="submit"
            style={{
              ...buttonStyle,
              opacity: loading ? 0.6 : 1,
              cursor: loading ? "not-allowed" : "pointer",
            }}
            disabled={loading}
          >
            {loading ? "Registering..." : "Register and Setup Picture Password"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: "20px" }}>
          Already have an account?{" "}
          <span
            style={{ color: "#1e90ff", cursor: "pointer" }}
            onClick={() => navigate("/login")}
          >
            Log In
          </span>
        </p>
      </div>
    </div>
  );
};

// ✅ Styles
const inputStyle = {
  display: "block",
  width: "100%",
  marginBottom: "15px",
  padding: "12px",
  borderRadius: "8px",
  border: "1px solid #ccc",
  fontSize: "16px",
};

const buttonStyle = {
  background: "#1e90ff",
  color: "#fff",
  border: "none",
  padding: "12px 20px",
  borderRadius: "8px",
  fontWeight: "600",
  fontSize: "16px",
  width: "100%",
  marginTop: "10px",
  transition: "background 0.3s",
};

export default RegisterPage;
