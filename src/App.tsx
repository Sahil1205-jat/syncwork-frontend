import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

// Pages
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Attendance from "./pages/Attendance";
import NoticeBoard from "./pages/NoticeBoard";
import Tasks from "./pages/Tasks"; 

export default function App() {
  return (
    <Router>
      <div className="bg-[#020617] min-h-screen text-slate-200">
        <Routes>
          {/* YAHAN GADBAD THI: Login route missing tha */}
          <Route path="/login" element={<Login />} />
          
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/attendance" element={<Attendance />} />
          <Route path="/notices" element={<NoticeBoard />} />
          <Route path="/tasks" element={<Tasks />} />
          
          {/* Fallback Route: Agar koi galat URL dale toh ab usko login par bhejna zyada safe hai */}
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </div>
      <Toaster position="top-right" />
    </Router>
  );
}