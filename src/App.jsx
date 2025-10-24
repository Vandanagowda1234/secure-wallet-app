import { Routes, Route } from "react-router-dom";
import RegisterPage from "./components/pages/RegisterPage.jsx";
import LoginPage from "./components/pages/LoginPage.jsx";
import PicturePasswordSetup from "./components/pages/PicturePasswordSetup.jsx";
import BiometricPage from "./components/pages/BiometricPage.jsx";
import DashboardPage from "./components/pages/DashboardPage.jsx";
import ZKPChallengePage from "./components/pages/ZKPChallengePage.jsx";
import BlockedPage from "./components/pages/BlockedPage.jsx";
import TransactionSuccessPage from "./components/pages/TransactionSuccessPage.jsx";

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

      {/* Catch-all route for unmatched paths */}
      <Route path="*" element={<div>404: Page Not Found</div>} />
    </Routes>
  );
}

export default App;
