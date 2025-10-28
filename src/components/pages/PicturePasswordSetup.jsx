import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../firebase"; // ✅ Firestore connection
import { doc, setDoc } from "firebase/firestore"; // ✅ Firestore methods

// ✅ Make sure these images exist in the "public/images/" folder
const images = [
  "/images/pic1.jpg",
  "/images/pic2.jpg",
  "/images/pic3.jpg",
  "/images/pic4.jpg",
  "/images/pic5.jpg",
  "/images/pic6.jpg",
];

const PicturePasswordSetup = () => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Toggle image selection (limit: 6)
  const toggleSelect = (img) => {
    if (selected.includes(img)) {
      setSelected((prev) => prev.filter((i) => i !== img));
    } else if (selected.length < 6) {
      setSelected((prev) => [...prev, img]);
    }
    setError("");
  };

  // ✅ Save selected images as picture password
  const handleSavePicturePassword = async () => {
    setError("");

    if (selected.length < 3) {
      setError("Please select at least 3 images in order.");
      return;
    }

    const userId = sessionStorage.getItem("userId");
    if (!userId) {
      setError("User ID not found. Please log in or register again.");
      return;
    }

    setLoading(true);

    try {
      // 🔥 Save to Firestore under users/{userId}
      const userRef = doc(db, "users", userId);
      await setDoc(
        userRef,
        {
          picturePassword: selected,
          picturePasswordSetOn: new Date().toISOString(),
        },
        { merge: true } // Don’t overwrite other user data
      );

      console.log("✅ Picture password saved for user:", userId);
      navigate("/login"); // Redirect to login page
    } catch (err) {
      console.error("❌ Firestore save error:", err);
      setError("Failed to save picture password. Please check Firestore rules.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        textAlign: "center",
        padding: "40px",
        maxWidth: "600px",
        margin: "40px auto",
        background: "#fff",
        borderRadius: "12px",
        boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
      }}
    >
      <h2 style={{ color: "#0056b3", marginBottom: "10px" }}>
        Step 3: Setup Picture Password 📸
      </h2>
      <p style={{ color: "#555", marginBottom: "25px" }}>
        Select at least <b>3 unique images</b> in order. The same order will be
        required to log in securely.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 150px)",
          gap: "20px",
          justifyContent: "center",
          margin: "20px 0",
        }}
      >
        {images.map((img, idx) => {
          const isSelected = selected.includes(img);
          const index = isSelected ? selected.indexOf(img) + 1 : null;
          return (
            <div
              key={idx}
              onClick={() => toggleSelect(img)}
              style={{ position: "relative", cursor: "pointer" }}
            >
              <img
                src={img} // ✅ Use actual image paths
                alt={`pic-${idx}`}
                style={{
                  width: "150px",
                  height: "150px",
                  objectFit: "cover",
                  border: isSelected ? "5px solid #1e90ff" : "2px solid #ccc",
                  borderRadius: "10px",
                  transform: isSelected ? "scale(1.05)" : "scale(1)",
                  transition: "all 0.2s ease",
                }}
              />
              {index && (
                <span
                  style={{
                    position: "absolute",
                    top: "5px",
                    right: "5px",
                    background: "#1e90ff",
                    color: "#fff",
                    borderRadius: "50%",
                    width: "28px",
                    height: "28px",
                    textAlign: "center",
                    fontSize: "16px",
                    lineHeight: "28px",
                    fontWeight: "bold",
                  }}
                >
                  {index}
                </span>
              )}
            </div>
          );
        })}
      </div>

      <p
        style={{
          margin: "20px 0",
          fontWeight: "bold",
          color: selected.length < 3 ? "#dc3545" : "#28a745",
        }}
      >
        Selected: {selected.length} / 3 Minimum
      </p>

      {error && (
        <p
          style={{
            color: "#dc3545",
            backgroundColor: "#f8d7da",
            padding: "10px",
            borderRadius: "6px",
            border: "1px solid #f5c6cb",
            margin: "15px 0",
          }}
        >
          {error}
        </p>
      )}

      <button
        onClick={handleSavePicturePassword}
        disabled={loading || selected.length < 3}
        style={{
          background: loading || selected.length < 3 ? "#ccc" : "#28a745",
          color: "#fff",
          border: "none",
          padding: "12px 30px",
          borderRadius: "6px",
          cursor: loading || selected.length < 3 ? "not-allowed" : "pointer",
          marginTop: "10px",
          fontSize: "18px",
          fontWeight: "bold",
          transition: "background 0.3s",
        }}
      >
        {loading ? "Saving..." : "Save Picture Password"}
      </button>
    </div>
  );
};

export default PicturePasswordSetup;
