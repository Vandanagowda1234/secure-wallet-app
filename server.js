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

// Your routes
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

app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
});
