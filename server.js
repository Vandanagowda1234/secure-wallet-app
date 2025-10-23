import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 5000;

// Enable CORS for all origins
app.use(cors());

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// -------------------------
// Picture password routes
// -------------------------
app.post("/api/register-picture-password", (req, res) => {
  const { userId, selectedPics } = req.body;
  console.log("Picture password saved for user:", userId, selectedPics);
  res.json({ success: true });
});

app.get("/api/get-picture-password/:userId", (req, res) => {
  const { userId } = req.params;
  const selectedPics = ["/images/pic1.jpg", "/images/pic3.jpg", "/images/pic5.jpg"];
  res.json({ success: true, selectedPics });
});

// -------------------------
// ZKP verification route
// -------------------------

// In-memory storage of user secret numbers (replace with DB in production)
// In-memory storage of user secret numbers (replace with DB in production)
const userSecrets = {
  "user123": [1, 2, 3, 4], // example secret numbers for testing
};

const frozenAccounts = new Set();

app.post("/api/zkp-verify", (req, res) => {
  const { userId, answers } = req.body;

  if (frozenAccounts.has(userId)) {
    return res.json({ success: false, message: "Account frozen" });
  }

  const secrets = userSecrets[userId];
  if (!secrets) {
    return res.status(400).json({ success: false, message: "User not found" });
  }

  const [n1, n2, n3, n4] = secrets;

  const expected = [
    n1 + n3,          // Q1
    (n1 + n3) + n2,   // Q2
    n1 * n4,          // Q3
    n3 - n1           // Q4
  ];

  // Check answers
  const correct = answers.every((ans, idx) => Number(ans) === expected[idx]);

  if (!correct) {
    frozenAccounts.add(userId);
    return res.json({ success: false, message: "Incorrect answers. Account frozen." });
  }

  return res.json({ success: true, message: "ZKP verified successfully!" });
});


// -------------------------
// Start server
// -------------------------
app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
});
