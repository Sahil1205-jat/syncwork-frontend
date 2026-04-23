import { motion } from "framer-motion";
import { User, Shield, Mail, Calendar, Key } from "lucide-react";
import toast from "react-hot-toast";

export default function Profile() {
  const userName = localStorage.getItem("user_name") || "Rudra Tiwari";
  const userRole = localStorage.getItem("user_role") || "DEVELOPER";
  const empCode = localStorage.getItem("user_id") || "EMP101";

  return (
    <div className="p-10 min-h-screen flex items-center justify-center">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
        className="max-w-xl w-full bg-slate-900 border border-slate-800 rounded-[3.5rem] p-12 relative overflow-hidden shadow-2xl"
      >
        <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }} transition={{ duration: 4, repeat: Infinity }} className="absolute -top-20 -left-20 w-64 h-64 bg-blue-600/20 blur-[100px] rounded-full" />
        
        <div className="relative text-center">
          <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-[2.5rem] mx-auto flex items-center justify-center text-5xl font-black text-white shadow-2xl mb-8 transform -rotate-3">
            {userName.charAt(0)}
          </div>
          <h2 className="text-4xl font-black text-white mb-2">{userName}</h2>
          <span className="px-4 py-1 bg-slate-800 rounded-full text-[10px] font-black text-blue-500 uppercase tracking-widest">{userRole} • {empCode}</span>

          <div className="mt-10 space-y-4 text-left">
            {[
              { icon: Mail, label: "Email Address", val: "usermailid@example.com" },
              { icon: Shield, label: "Access Level", val: userRole },
              { icon: Calendar, label: "Onboarding Date", val: "2026-04-22" }
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-4 p-5 bg-slate-950/50 border border-slate-800 rounded-2xl">
                <item.icon className="text-slate-500" size={20} />
                <div>
                  <p className="text-[9px] font-black text-slate-600 uppercase">{item.label}</p>
                  <p className="text-sm font-bold text-slate-200">{item.val}</p>
                </div>
              </div>
            ))}
          </div>
          
          <button onClick={() => toast.success("Reset link sent!")} className="w-full mt-8 h-14 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-black flex items-center justify-center gap-2 border border-slate-700 transition-all">
            <Key size={18} /> RESET PASSWORD
          </button>
        </div>
      </motion.div>
    </div>
  );
}