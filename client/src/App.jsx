import { Routes, Route, Navigate } from "react-router-dom";

import Signup from "./pages/Signup";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import MainPage from "./pages/MainPage";

// TEMP DASHBOARD (you can remove later)
function Dashboard() {
  return (
    <div style={{
      height: "100vh",
      background: "#020810",
      color: "#39ff64",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "monospace"
    }}>
      DASHBOARD (TEMP)
    </div>
  );
}

function App() {
  return (
    <Routes>

      {/* root → signup */}
      <Route path="/" element={<Navigate to="/signup" />} />

      {/* auth pages */}
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />

      {/* main page after login/signup */}
      <Route
        path="/main"
        element={
          <ProtectedRoute>
            <MainPage />
          </ProtectedRoute>
        }
      />

      {/* optional dashboard (you can delete later) */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

    </Routes>
  );
}

export default App;