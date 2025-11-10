// ✅ src/components/pages/UnfreezePage.jsx
import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../../firebase";

export default function UnfreezePage() {
  const [message, setMessage] = useState("Checking link...");
  const [loading, setLoading] = useState(true);
  const [valid, setValid] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const userId = searchParams.get("userId");
  const code = searchParams.get("code");

  useEffect(() => {
    const verifyCode = async () => {
      if (!userId || !code) {
        setMessage("Invalid link.");
        setLoading(false);
        return;
      }

      try {
        const codeRef = doc(db, "unfreezeCodes", userId);
        const docSnap = await getDoc(codeRef);

        if (!docSnap.exists()) {
          setMessage("Code not found or expired.");
          setLoading(false);
          return;
        }

        const data = docSnap.data();
        if (data.code === code && data.expiresAt > Date.now()) {
          // ✅ Unfreeze the account
          await updateDoc(doc(db, "users", userId), { isFrozen: false });

          // ✅ Remove OTP after successful use
          await deleteDoc(codeRef);

          // ✅ Store userId in sessionStorage so ZKP page or dashboard can access it
          sessionStorage.setItem("userId", userId);

          setMessage("✅ Your account has been successfully unfrozen!");
          setValid(true);

          // ✅ Redirect to ZKP Challenge or Dashboard after 2 seconds
          setTimeout(() => navigate("/zkp-challenge"), 2000);
        } else {
          setMessage("Invalid or expired code.");
        }
      } catch (err) {
        console.error(err);
        setMessage("Error verifying code.");
      } finally {
        setLoading(false);
      }
    };

    verifyCode();
  }, [userId, code, navigate]);

  return (
    <div style={{ padding: "50px", textAlign: "center" }}>
      {loading ? "Loading..." : message}
    </div>
  );
}