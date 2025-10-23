// src/components/pages/ZKPChallengePage.jsx
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function ZKPChallengePage() {
  const navigate = useNavigate();
  const [answers, setAnswers] = useState(["", "", "", ""]);
  const [message, setMessage] = useState("");

  const userId = "user123"; // Replace with actual logged-in user ID

  const handleChange = (idx, value) => {
    const newAnswers = [...answers];
    newAnswers[idx] = value;
    setAnswers(newAnswers);
  };

  const handleVerify = async () => {
    try {
      const response = await axios.post("http://localhost:5000/api/zkp-verify", {
        userId,
        answers,
      });

      if (response.data.success) {
        setMessage("✅ ZKP verified successfully!");
        // Redirect to dashboard after verification
        setTimeout(() => navigate("/dashboard"), 1000);
      } else {
        setMessage("❌ " + response.data.message);
        // Redirect to blocked page if account frozen
        if (response.data.message.includes("frozen")) {
          setTimeout(() => navigate("/blocked"), 1500);
        }
      }
    } catch (error) {
      console.error(error);
      setMessage("⚠️ Server error. Try again.");
    }
  };

  return (
    <div className="zkp-page">
      <h2>Zero Knowledge Challenge</h2>
      <ol>
        <li>
          Sum of 1st and 3rd numbers:
          <input
            type="number"
            value={answers[0]}
            onChange={(e) => handleChange(0, e.target.value)}
          />
        </li>
        <li>
          Sum of previous answer + 2nd number:
          <input
            type="number"
            value={answers[1]}
            onChange={(e) => handleChange(1, e.target.value)}
          />
        </li>
        <li>
          Product of 1st and 4th numbers:
          <input
            type="number"
            value={answers[2]}
            onChange={(e) => handleChange(2, e.target.value)}
          />
        </li>
        <li>
          Difference between 3rd and 1st numbers:
          <input
            type="number"
            value={answers[3]}
            onChange={(e) => handleChange(3, e.target.value)}
          />
        </li>
      </ol>

      <button onClick={handleVerify}>Verify Proof & Send</button>

      {message && <p>{message}</p>}
    </div>
  );
}
