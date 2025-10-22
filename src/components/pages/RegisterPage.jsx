// src/components/pages/RegisterPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../../firebase";

const RegisterPage = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [zkpPin, setZkpPin] = useState("");
  const [error, setError] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password || !username || !phone || !zkpPin) {
      setError("All fields are required.");
      return;
    }

    try {
      const user = await registerUser(email, password, username, phone, zkpPin);

      console.log("✅ Registered user:", user);

      // Save user ID in session for picture password setup
      sessionStorage.setItem("userId", user.uid);

      // Redirect to Picture Password setup
      navigate("/setup-picture-password");
    } catch (err) {
      console.error("Registration error:", err.message);
      setError(err.message);
    }
  };

  return (
    <div className="page-container">
      <h2>Step 1: Account Registration 📜</h2>
      <form onSubmit={handleRegister} style={{ maxWidth: "400px", margin: "0 auto" }}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ display: "block", width: "100%", marginBottom: "10px", padding: "8px" }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ display: "block", width: "100%", marginBottom: "10px", padding: "8px" }}
        />
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{ display: "block", width: "100%", marginBottom: "10px", padding: "8px" }}
        />
        <input
          type="text"
          placeholder="Phone Number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          style={{ display: "block", width: "100%", marginBottom: "10px", padding: "8px" }}
        />
        <input
          type="text"
          placeholder="4-Digit ZKP PIN"
          value={zkpPin}
          onChange={(e) => setZkpPin(e.target.value)}
          maxLength={4}
          style={{ display: "block", width: "100%", marginBottom: "10px", padding: "8px" }}
        />

        {error && <p style={{ color: "red" }}>{error}</p>}

        <button
          type="submit"
          style={{
            background: "#1e90ff",
            color: "#fff",
            border: "none",
            padding: "10px 20px",
            borderRadius: "6px",
            cursor: "pointer",
            marginTop: "10px",
            width: "100%"
          }}
        >
          Register and Proceed to Login
        </button>
      </form>

      <p style={{ marginTop: "15px", textAlign: "center" }}>
        Already have an account?{" "}
        <span
          style={{ color: "#1e90ff", cursor: "pointer" }}
          onClick={() => navigate("/login")}
        >
          Log In
        </span>
      </p>
    </div>
  );
};

export default RegisterPage;
