// src/components/pages/PicturePasswordSetup.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const images = [
  "/images/pic0.jpg",
  "/images/pic1.jpg",
  "/images/pic2.jpg",
  "/images/pic3.jpg",
  "/images/pic4.jpg",
  "/images/pic5.jpg",
];

const PicturePasswordSetup = () => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState([]);
  const [error, setError] = useState("");

  const toggleSelect = (img) => {
    setSelected((prev) =>
      prev.includes(img) ? prev.filter((i) => i !== img) : [...prev, img]
    );
  };

  const handleSavePicturePassword = async () => {
    if (selected.length < 3) {
      setError("Select at least 3 pictures");
      return;
    }

    const userId = sessionStorage.getItem("userId");
    if (!userId) {
      setError("User ID not found. Please register again.");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/register-picture-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, selectedPics: selected }),
        });


      const data = await res.json();

      if (data.success) {
        alert("✅ Picture password saved!");
        navigate("/login"); // redirect to login
      } else {
        setError("Failed to save picture password: " + data.message);
      }
    } catch (err) {
      console.error("Error saving picture password:", err);
      setError("Failed to save picture password.");
    }
  };

  return (
    <div className="page-container">
      <h2>Step 2: Setup Picture Password 📸</h2>
      <p>Select at least 3 images for your picture password</p>

      <div
        className="grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 100px)",
          gap: "15px",
          justifyContent: "center",
          margin: "20px 0",
        }}
      >
        {images.map((img, idx) => (
          <img
            key={idx}
            src={img}
            alt={`pic-${idx}`}
            onClick={() => toggleSelect(img)}
            style={{
              width: "100px",
              height: "100px",
              cursor: "pointer",
              border: selected.includes(img) ? "4px solid #1e90ff" : "2px solid #ccc",
              borderRadius: "8px",
            }}
          />
        ))}
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <button
        onClick={handleSavePicturePassword}
        style={{
          background: "#1e90ff",
          color: "#fff",
          border: "none",
          padding: "10px 20px",
          borderRadius: "6px",
          cursor: "pointer",
          marginTop: "10px",
        }}
      >
        Save Picture Password
      </button>
    </div>
  );
};

export default PicturePasswordSetup;
