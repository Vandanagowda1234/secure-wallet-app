// src/components/pages/ZKPChallengePage.jsx
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { submitZKPTransaction } from '../../blockchain'; // reuse same blockchain helper

const ZKPChallengePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const walletAddress = location.state?.walletAddress || "";

  const questions = [
    "1) What is the sum of the 1st and 3rd numbers?",
    "2) What is the sum of the previous answer and the 2nd number?",
    "3) What is the product of the 1st and 4th numbers?",
    "4) What is the difference between the 3rd and 1st numbers?"
  ];

  const [answers, setAnswers] = useState(['', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAnswerChange = (index, value) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Simulate backend ZKP verification
      const response = await fetch("http://localhost:5000/api/verifyZkp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress, answers }),
      });

      const data = await response.json();

      if (data.success) {
        alert("✅ ZKP Verification Successful!\nTransaction Authorized.");
        await submitZKPTransaction(walletAddress); // call your blockchain transaction
        navigate("/dashboard");
      } else {
        alert("❌ Verification Failed! Your account is now blocked.");
        await fetch("http://localhost:5000/api/blockUser", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ walletAddress }),
        });
        navigate("/blocked");
      }
    } catch (err) {
      console.error("ZKP Verification Error:", err);
      setError("An error occurred during verification.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-8">
      <div className="max-w-lg w-full bg-gray-800 rounded-2xl p-6 shadow-lg">
        <h1 className="text-2xl font-bold mb-4 text-center">🧠 Zero Knowledge Challenge</h1>
        <p className="text-center mb-6 text-gray-300">
          Answer the following arithmetic questions to prove your identity.
        </p>

        <form onSubmit={handleVerify}>
          {questions.map((q, index) => (
            <div key={index} className="mb-5">
              <label className="block mb-2 font-medium">{q}</label>
              <input
                type="number"
                value={answers[index]}
                onChange={(e) => handleAnswerChange(index, e.target.value)}
                placeholder={`Answer ${index + 1}`}
                required
                className="w-full p-2 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ))}

          {error && <p className="text-red-500 text-center mb-3">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-300"
          >
            {loading ? "Verifying..." : "Verify Proof"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ZKPChallengePage;
