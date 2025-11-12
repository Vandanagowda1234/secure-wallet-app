// src/App.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";

import RegisterPage from "./components/pages/RegisterPage.jsx";
import LoginPage from "./components/pages/LoginPage.jsx";
import PicturePasswordSetup from "./components/pages/PicturePasswordSetup.jsx";
import BiometricPage from "./components/pages/BiometricPage.jsx";
import DashboardPage from "./components/pages/DashboardPage.jsx";
import ZKPChallengePage from "./components/pages/ZKPChallengePage.jsx";
import BlockedPage from "./components/pages/BlockedPage.jsx";
import TransactionSuccessPage from "./components/pages/TransactionSuccessPage.jsx";
import UnfreezeVerificationPage from "./components/pages/UnfreezeVerificationPage.jsx";
import UnfreezePage from "./components/pages/UnfreezePage.jsx";
import UnfreezeSuccessPage from "./components/pages/UnfreezeSuccessPage.jsx";

function App() {
  return (
    <Routes>
      <Route path="/" element={<RegisterPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/setup-picture-password" element={<PicturePasswordSetup />} />
      <Route path="/biometric" element={<BiometricPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/zkp-challenge" element={<ZKPChallengePage />} />
      <Route path="/blocked" element={<BlockedPage />} />
      <Route path="/transaction-success" element={<TransactionSuccessPage />} />

      {/* ✅ Correct unique routes */}
      <Route path="/unfreeze-verification" element={<UnfreezeVerificationPage />} />
      <Route path="/unfreeze" element={<UnfreezePage />} />
      <Route path="/unfreeze-success" element={<UnfreezeSuccessPage />} />

      {/* 404 fallback */}
      <Route path="*" element={<div>404: Page Not Found</div>} />
    </Routes>
  );
}

export default App;
