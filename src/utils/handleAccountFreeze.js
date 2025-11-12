import axios from "axios";

export default async function handleAccountFreeze(userId, email) {
  const unfreezeLink = `http://localhost:5174/unfreeze?userId=${userId}`;
  try {
    await axios.post("http://localhost:5000/send-unfreeze-email", {
      email,
      link: unfreezeLink,
    });
    console.log("✅ Unfreeze email sent to:", email);
  } catch (err) {
    console.error("❌ Failed to send unfreeze email:", err);
  }
}
