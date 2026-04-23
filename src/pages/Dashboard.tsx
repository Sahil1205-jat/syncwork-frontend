import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutGrid, Users, Clock, CalendarDays, Megaphone, 
  Banknote, BarChart, ListTodo, User, LogOut, 
  Icon
} from "lucide-react";

import StaffDirectory from "./StaffDirectory"; 
import Attendance from "./Attendance"; 
import LeaveManagement from "./LeaveManagement"; 
import NoticeBoard from "./NoticeBoard";
import Tasks from "./Tasks";
import Payroll from "./Payroll";
import Analytics from "./Analytics";
import Profile from "./Profile";

import { Label } from "radix-ui";


export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("directory");
  const userRole = localStorage.getItem("user_role") || "EMPLOYEE";
  const userName = localStorage.getItem("user_name") || "User"; 

  const navItems = [
    { id: "directory", label: "Staff Directory", icon: Users },
    { id: "attendance", label: "Attendance", icon: Clock },
    { id: "leaves", label: "Leaves", icon: CalendarDays },
    { id: "notices", label: "Notice Board", icon: Megaphone },
    { id: "tasks", label: "Project Tasks", icon: ListTodo },
    { id: "payroll", label: "Payroll", icon: Banknote },
    { id: "analytics", label: "Analytics", icon: BarChart },
    { id: "profile", label: "My Profile", icon: User },
  
  ];

  return (
    <div className="flex h-screen bg-[#020617] text-slate-200 font-sans overflow-hidden">
      {/* SIDEBAR */}
      <aside className="w-72 bg-slate-900/50 border-r border-slate-800/50 flex flex-col justify-between backdrop-blur-xl">
        <div>
          <div className="p-8 border-b border-slate-800/50 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/30">
                <LayoutGrid className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-black italic tracking-tighter text-white">SYNCWORK</h1>
            </div>
            <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-2.5 py-1 rounded border ${
              userRole === 'ADMIN' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-blue-500/10 text-blue-500 border-blue-500/20'
            }`}>
              {userRole} PORTAL
            </span>
          </div>

          <nav className="px-4 space-y-1">
            {navItems.map((item) => (
              <button 
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold transition-all ${
                  activeTab === item.id 
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20 scale-[1.02]" 
                  : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                }`}
              >
                <item.icon className="w-5 h-5" /> {item.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-4 border-t border-slate-800/50">
          <div className="flex items-center gap-3 px-4 py-3 mb-2 bg-slate-950/30 rounded-2xl border border-slate-800/50">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-black text-white">
              {userName.charAt(0)}
            </div>
            <div className="truncate text-left">
              <p className="text-xs font-black text-white truncate"> Rudra Tiwari</p>
              <p className="text-[9px] text-slate-500 font-bold uppercase">Online</p>
            </div>
          </div>
          <button onClick={() => {localStorage.clear(); window.location.href="./Login"}} className="w-full flex items-center justify-center gap-2 py-3 text-rose-500 font-bold hover:bg-rose-500/10 rounded-xl transition-all">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      {/* CONTENT AREA WITH ANIMATION */}
      <main className="flex-1 overflow-y-auto bg-[#020617] relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 15, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -15, filter: "blur(8px)" }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === "directory" && <StaffDirectory />}
            {activeTab === "attendance" && <Attendance />}
            {activeTab === "leaves" && <LeaveManagement />}
            {activeTab === "notices" && <NoticeBoard />}
            {activeTab === "tasks" && <Tasks />}
            {activeTab === "payroll" && <Payroll />}
            {activeTab === "analytics" && <Analytics />}
            {activeTab === "profile" && <Profile />}
           
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}