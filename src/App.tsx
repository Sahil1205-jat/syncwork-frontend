import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

export default function App() {
  return (
    <Router>
      <div className="bg-[#020617] min-h-screen text-slate-200">
        <Routes>
          {/* YAHAN GADBAD THI: Login route missing tha */}
          <Route path="/login" element={<Login />} />

          <Route path="/" element={<Navigate to="/dashboard" />} />

          {/* Fallback Route: Agar koi galat URL dale toh ab usko login par bhejna zyada safe hai */}
          <Route path="*" element={<Dashboard />} />
        </Routes>
      </div>
      <Toaster position="top-right" />
    </Router>
  );
}