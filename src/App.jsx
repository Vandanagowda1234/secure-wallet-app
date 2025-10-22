import { Routes, Route } from "react-router-dom";
import RegisterPage from "./components/pages/RegisterPage.jsx";
import LoginPage from "./components/pages/LoginPage.jsx";
import PicturePasswordSetup from "./components/pages/PicturePasswordSetup.jsx";
import BiometricPage from "./components/pages/BiometricPage.jsx";
import DashboardPage from "./components/pages/DashboardPage.jsx";

function App() {
  return (
    <Routes>
      <Route path="/" element={<RegisterPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/setup-picture-password" element={<PicturePasswordSetup />} />
      <Route path="/biometric" element={<BiometricPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
    </Routes>
  );
}

export default App;
