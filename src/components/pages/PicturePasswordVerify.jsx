// src/components/pages/PicturePasswordVerify.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../firebase.js";
import { doc, getDoc } from "firebase/firestore";

// ✅ Use same filenames as stored during registration
const images = [
  "/images/pic1.jpg",
  "/images/pic2.jpg",
  "/images/pic3.jpg",
  "/images/pic4.jpg",
  "/images/pic5.jpg",
  "/images/pic6.jpg",
];

// 🔗 Firestore document path
const getUserProfileDoc = (userId) =>
  doc(db, "artifacts", "walletapp-a97d5", "users", userId, "user_data", "profile");

const PicturePasswordVerify = () => {
  const navigate = useNavigate();
  const [correctSequence, setCorrectSequence] = useState([]);
  const [selectedSequence, setSelectedSequence] = useState([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const userId = sessionStorage.getItem("userId");

  // 🧠 Step 1: Fetch stored picture password
  useEffect(() => {
    const fetchData = async () => {
      if (!userId) {
        setError("User not found. Please login again.");
        setLoading(false);
        return;
      }

      try {
        const docRef = getUserProfileDoc(userId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists() && docSnap.data().picturePassword) {
          const savedSequence = docSnap.data().picturePassword.map((img) =>
            img.split("/").pop().trim()
          ); // Normalize filenames only
          setCorrectSequence(savedSequence);
          setMessage(`Click ${savedSequence.length} images in your saved order.`);
        } else {
          setError("No picture password found. Please set it up first.");
        }
      } catch (err) {
        console.error("Error fetching password:", err);
        setError("Failed to fetch data. Check Firestore connection.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  // 🎯 Step 2: Handle image click
  const handleImageClick = (img) => {
    if (!correctSequence.length || error) return;

    const newSequence = [...selectedSequence, img.split("/").pop().trim()];
    setSelectedSequence(newSequence);

    const currentStep = newSequence.length - 1;

    // ✅ Compare normalized values
    if (newSequence[currentStep] !== correctSequence[currentStep]) {
      setError("❌ Incorrect sequence. Please try again.");
      setSelectedSequence([]);
      return;
    }

    // ✅ If full sequence matches
    if (newSequence.length === correctSequence.length) {
      setMessage("✅ Picture Password Verified! Redirecting...");
      setError("");
      setTimeout(() => navigate("/dashboard"), 1200);
    } else {
      setMessage(`Good! (${newSequence.length}/${correctSequence.length}) Continue...`);
    }
  };

  // 🔁 Reset manually
  const handleReset = () => {
    setSelectedSequence([]);
    setError("");
    setMessage(`Click ${correctSequence.length} images in order.`);
  };

  if (loading) {
    return (
      <div style={pageContainerStyle}>
        <h3 style={{ color: "#1e90ff" }}>Loading your picture password...</h3>
      </div>
    );
  }

  if (error && !correctSequence.length) {
    return (
      <div style={pageContainerStyle}>
        <h3 style={{ color: "tomato" }}>{error}</h3>
        <button onClick={() => navigate("/login")} style={resetButtonStyle}>
          Back to Login
        </button>
      </div>
    );
  }

  return (
    <div style={pageContainerStyle}>
      <div style={cardStyle}>
        <h2 style={{ color: "#0056b3" }}>Step 3: Verify Picture Password 🖼️</h2>
        <p style={{ color: "#555" }}>
          Click the images in your secret sequence ({selectedSequence.length}/{correctSequence.length})
        </p>

        <div style={gridStyle}>
          {images.map((img, index) => {
            const isSelected = selectedSequence.includes(img.split("/").pop());
            const order = selectedSequence.indexOf(img.split("/").pop()) + 1;

            return (
              <div
                key={index}
                onClick={() => handleImageClick(img)}
                style={{
                  position: "relative",
                  cursor: "pointer",
                  opacity: isSelected ? 0.8 : 1,
                  transition: "transform 0.3s",
                }}
              >
                <img
                  src={img}
                  alt={`pic-${index}`}
                  style={{
                    width: "160px",
                    height: "160px",
                    borderRadius: "10px",
                    border: isSelected ? "6px solid #28a745" : "3px solid #ccc",
                    transform: isSelected ? "scale(1.05)" : "scale(1)",
                  }}
                />
                {order > 0 && <span style={orderBadgeStyle}>{order}</span>}
              </div>
            );
          })}
        </div>

        {message && <p style={messageStyle}>{message}</p>}
        {error && <p style={errorStyle}>{error}</p>}

        <button onClick={handleReset} style={resetButtonStyle}>
          Reset Selection
        </button>
      </div>
    </div>
  );
};

// 🎨 Styles (same as before)
const pageContainerStyle = {
  minHeight: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  background: "linear-gradient(135deg, #f5f7fa, #c3cfe2)",
  padding: "40px",
};

const cardStyle = {
  background: "#fff",
  padding: "40px",
  borderRadius: "15px",
  boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
  maxWidth: "650px",
  textAlign: "center",
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(3, 160px)",
  gap: "20px",
  justifyContent: "center",
  margin: "25px 0",
};

const messageStyle = {
  color: "#28a745",
  backgroundColor: "#e9f7ef",
  padding: "10px",
  borderRadius: "6px",
  border: "1px solid #c3e6cb",
  fontWeight: "bold",
};

const errorStyle = {
  color: "#dc3545",
  backgroundColor: "#f8d7da",
  padding: "10px",
  borderRadius: "6px",
  border: "1px solid #f5c6cb",
  fontWeight: "bold",
};

const orderBadgeStyle = {
  position: "absolute",
  top: "5px",
  right: "5px",
  background: "#28a745",
  color: "#fff",
  borderRadius: "50%",
  width: "30px",
  height: "30px",
  textAlign: "center",
  fontSize: "16px",
  fontWeight: "bold",
  lineHeight: "30px",
};

const resetButtonStyle = {
  background: "#f0ad4e",
  color: "#fff",
  border: "none",
  padding: "10px 20px",
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: "16px",
  fontWeight: "bold",
  marginTop: "20px",
};

export default PicturePasswordVerify;
