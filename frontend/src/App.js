import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import SubmitCode from "./pages/SubmitCode";
import ReviewReport from "./pages/ReviewReport";
import History from "./pages/History";
import Analytics from "./pages/Analytics";
import Profile from "./pages/Profile";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-[#09090B]">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/submit" element={<ProtectedRoute><SubmitCode /></ProtectedRoute>} />
            <Route path="/review/:id" element={<ProtectedRoute><ReviewReport /></ProtectedRoute>} />
            <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
            <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          </Routes>
          <Toaster position="top-right" theme="dark" />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
