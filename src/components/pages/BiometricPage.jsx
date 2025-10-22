import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const images = [
  "/images/pic1.jpg",
  "/images/pic2.jpg",
  "/images/pic3.jpg",
  "/images/pic4.jpg",
  "/images/pic5.jpg",
  "/images/pic6.jpg",
];

const BiometricPage = ({ userId }) => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState([]);
  const [storedPics, setStoredPics] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStoredPics = async () => {
      try {
        const res = await fetch(`/api/get-picture-password/${userId}`);
        const data = await res.json();
        if (data.success) setStoredPics(data.selectedPics);
      } catch (err) {
        console.error(err);
        setError("Failed to load picture password.");
      }
    };
    fetchStoredPics();
  }, [userId]);

  const toggleSelect = (img) => {
    setSelected((prev) =>
      prev.includes(img) ? prev.filter((i) => i !== img) : [...prev, img]
    );
  };

  const handleVerify = () => {
    const isCorrect =
      selected.length === storedPics.length &&
      selected.every((img) => storedPics.includes(img));

    if (isCorrect) {
      alert("✅ Verified! Logging in...");
      navigate("/dashboard");
    } else {
      setError("❌ Incorrect picture password.");
      setSelected([]);
    }
  };

  return (
    <div className="page-container">
      <h2>Step 3: Picture Password Verification 📸</h2>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 100px)", gap: "15px" }}>
        {images.map((img, idx) => (
          <img
            key={idx}
            src={img}
            alt={`pic-${idx}`}
            onClick={() => toggleSelect(img)}
            style={{
              width: "100px",
              height: "100px",
              border: selected.includes(img) ? "3px solid #1e90ff" : "1px solid #ccc",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          />
        ))}
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <button
        onClick={handleVerify}
        style={{
          marginTop: "20px",
          padding: "10px 20px",
          background: "#1e90ff",
          color: "#fff",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
        }}
      >
        Verify Picture Password
      </button>
    </div>
  );
};

export default BiometricPage;
