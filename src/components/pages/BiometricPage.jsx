// src/components/pages/BiometricPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getUserImageData } from "../../firebase";

const BiometricPage = () => {
  const navigate = useNavigate();
  const [allImages, setAllImages] = useState([]);
  const [savedPassword, setSavedPassword] = useState([]);
  const [selectedImages, setSelectedImages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const userId =
          sessionStorage.getItem("userId") || localStorage.getItem("userId");
        if (!userId) {
          alert("Session expired. Please log in again.");
          navigate("/login");
          return;
        }

        const { allImages, savedPassword } = await getUserImageData(userId);
        setAllImages(allImages);
        setSavedPassword(savedPassword);
      } catch (error) {
        console.error("❌ Error loading images:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchImages();
  }, [navigate]);

  const handleSelect = (img) => {
    if (selectedImages.includes(img)) {
      setSelectedImages(selectedImages.filter((i) => i !== img));
    } else if (selectedImages.length < 3) {
      setSelectedImages([...selectedImages, img]);
    }
  };

  // ✅ Updated verification logic (only this part changed)
  const handleVerify = () => {
    const normalize = (arr) => arr.map((img) => img.split("/").pop());
    const selected = normalize(selectedImages);
    const saved = normalize(savedPassword);

    if (JSON.stringify(selected) === JSON.stringify(saved)) {
      alert("✅ Picture Password Verified!");
      navigate("/dashboard");
    } else {
      alert("❌ Incorrect Picture Password! Try again.");
      setSelectedImages([]);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", marginTop: "50px", color: "#555" }}>
        Loading images...
      </div>
    );
  }

  return (
    <div
      style={{
        fontFamily: "Poppins, sans-serif",
        textAlign: "center",
        marginTop: "40px",
        width: "100%",
      }}
    >
      <h2 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "10px" }}>
        Step 3: Verify Picture Password 🔒
      </h2>

      <p style={{ color: "#555", marginBottom: "25px" }}>
        Select your 3 images in the same order as you did during registration.
      </p>

      {/* ✅ Image Grid */}
      <div className="image-grid">
        {allImages.map((img, index) => (
          <img
            key={index}
            src={img}
            alt={`pic-${index}`}
            className={`selectable-image ${
              selectedImages.includes(img) ? "selected" : ""
            }`}
            onClick={() => handleSelect(img)}
            onError={(e) => {
              e.target.src = `${window.location.origin}/images/fallback.jpg`;
            }}
          />
        ))}
      </div>

      <p
        style={{
          marginTop: "20px",
          color: selectedImages.length < 3 ? "red" : "green",
          fontWeight: "500",
        }}
      >
        Selected: {selectedImages.length} / 3 Minimum
      </p>

      <button
        onClick={handleVerify}
        disabled={selectedImages.length < 3}
        style={{
          marginTop: "15px",
          backgroundColor: selectedImages.length === 3 ? "#007bff" : "#ccc",
          color: "white",
          padding: "10px 25px",
          borderRadius: "8px",
          border: "none",
          cursor: selectedImages.length === 3 ? "pointer" : "not-allowed",
          fontWeight: "600",
          transition: "0.3s",
        }}
      >
        Verify Picture Password
      </button>
    </div>
  );
};

export default BiometricPage;  