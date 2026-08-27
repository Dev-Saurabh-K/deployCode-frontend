import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DeployPage from "./pages/DeployPage";

export default function App() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/deploy"
          element={
            <ProtectedRoute>
              <DeployPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/deploy" replace />} />
      </Routes>
    </div>
  );
}
