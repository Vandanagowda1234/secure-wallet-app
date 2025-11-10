import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";

export default function UnfreezeVerificationPage() {
  const [message, setMessage] = useState("Verifying...");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const code = searchParams.get("code");

  useEffect(() => {
    const verify = async () => {
      if (!code) {
        setMessage("Invalid link!");
        return;
      }

      const { data, error } = await supabase
        .from("unfreeze")
        .select("*")
        .eq("verification_code", code)
        .single();

      if (error || !data) {
        setMessage("Invalid or expired link!");
        return;
      }

      // ✅ Update status to verified
      await supabase
        .from("unfreeze")
        .update({ status: "verified" })
        .eq("verification_code", code);

      setMessage("Account successfully unfrozen! Redirecting...");

      setTimeout(() => {
        navigate("/dashboard"); // redirect to dashboard
      }, 2000);
    };

    verify();
  }, [code]);

  return <div style={{ padding: "50px", textAlign: "center" }}>{message}</div>;
}
