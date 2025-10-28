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

  const handleVerify = () => {
    if (JSON.stringify(selectedImages) === JSON.stringify(savedPassword)) {
      alert("✅ Picture Password Verified!");
      navigate("/dashboard");
    } else {
      alert("❌ Incorrect Picture Password! Try again.");
      setSelectedImages([]);
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-12 text-gray-600 text-lg">
        Loading images...
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center mt-10 font-[Poppins] w-full">
      <h2 className="text-2xl font-bold mb-4 text-center">
        Step 3: Verify Picture Password 🔒
      </h2>
      <p className="text-gray-600 mb-6 text-center">
        Select your 3 images in the same order as you did during registration.
      </p>

      {/* ✅ 3x2 Grid Layout */}
      <div className="grid grid-cols-3 gap-8 mb-8 w-[90%] max-w-3xl justify-items-center">
        {allImages.map((img, index) => (
          <div
            key={index}
            className={`border-4 rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 shadow-md ${
              selectedImages.includes(img)
                ? "border-green-500 scale-105"
                : "border-gray-300"
            }`}
            onClick={() => handleSelect(img)}
          >
            <img
              src={img}
              alt={`pic-${index}`}
              className="w-40 h-40 object-cover"
              onError={(e) => {
                e.target.src = `${window.location.origin}/images/fallback.jpg`;
              }}
            />
          </div>
        ))}
      </div>

      <p
        className={`text-center mb-4 font-medium ${
          selectedImages.length < 3 ? "text-red-500" : "text-green-600"
        }`}
      >
        Selected: {selectedImages.length} / 3 Minimum
      </p>

      <button
        onClick={handleVerify}
        className={`${
          selectedImages.length === 3
            ? "bg-blue-600 hover:bg-blue-700"
            : "bg-gray-400 cursor-not-allowed"
        } text-white font-semibold py-2 px-8 rounded-lg shadow`}
        disabled={selectedImages.length < 3}
      >
        Verify Picture Password
      </button>
    </div>
  );
};

export default BiometricPage;
