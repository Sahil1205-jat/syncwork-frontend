import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ClipboardList, Plus, Trash2, CheckCircle2, 
  Clock, AlertCircle, User, Calendar, X 
} from "lucide-react";
import toast from "react-hot-toast";

export default function Tasks() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [newTask, setNewTask] = useState({
    title: "",
    assignedTo: "", 
    priority: "MEDIUM",
    dueDate: ""
  });

  const userRole = localStorage.getItem("user_role") || "EMPLOYEE";
  const myEmpCode = localStorage.getItem("user_id") || "";
  const isAdmin = userRole === "ADMIN";

  const fetchTasks = async () => {
    const url = isAdmin 
      ? "http://localhost:8080/api/tasks/all" 
      : `http://localhost:8080/api/tasks/emp/${myEmpCode}`;
    
    try {
      const res = await fetch(url);
      if (res.ok) setTasks(await res.json());
    } catch (error) { console.error("Error fetching tasks"); }
  };

  useEffect(() => { fetchTasks(); }, []);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8080/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTask)
      });

      if (res.ok) {
        toast.success(`Task assigned and Email Sent!`);
        setNewTask({ title: "", assignedTo: "", priority: "MEDIUM", dueDate: "" });
        setShowForm(false);
        fetchTasks();
      }
    } catch (error) { toast.error("Server Error"); }
    finally { setLoading(false); }
  };

  const updateStatus = async (id: number, currentStatus: string) => {
    const nextStatus = currentStatus === "PENDING" ? "IN_PROGRESS" : "COMPLETED";
    try {
      const res = await fetch(`http://localhost:8080/api/tasks/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nextStatus)
      });
      if (res.ok) {
        toast.success(`Status: ${nextStatus}`);
        fetchTasks();
      }
    } catch (error) { toast.error("Update failed"); }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Bhai, pakka udaana hai ye task?")) return;
    try {
      const res = await fetch(`http://localhost:8080/api/tasks/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Task deleted");
        fetchTasks();
      }
    } catch (error) { toast.error("Delete failed"); }
  };

  return (
    <div className="p-6 lg:p-10 max-w-6xl mx-auto text-slate-200">
      
      <div className="flex justify-between items-center mb-10">
        <div>
          <h2 className="text-4xl font-black text-white italic flex items-center gap-3">
            <ClipboardList className="text-blue-500" size={36} /> Task Center
          </h2>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.3em] mt-1">
            Workforce Task Management
          </p>
        </div>
        
        {isAdmin && (
          <button 
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 hover:bg-blue-500 text-white p-4 rounded-2xl shadow-xl transition-all"
          >
            {showForm ? <X size={24}/> : <Plus size={24}/>}
          </button>
        )}
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.form 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            onSubmit={handleCreateTask}
            className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 mb-10 grid grid-cols-1 md:grid-cols-2 gap-4 overflow-hidden"
          >
            <div className="md:col-span-2">
              <input 
                required placeholder="Task Details..."
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white font-bold outline-none focus:border-blue-500"
                value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})}
              />
            </div>
            <input 
              required placeholder="Emp Code (e.g. EMP101)"
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white outline-none focus:border-blue-500"
              value={newTask.assignedTo} onChange={e => setNewTask({...newTask, assignedTo: e.target.value.toUpperCase()})}
            />
            <input 
              required type="date"
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white outline-none focus:border-blue-500"
              value={newTask.dueDate} onChange={e => setNewTask({...newTask, dueDate: e.target.value})}
            />
            <select 
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white outline-none"
              value={newTask.priority} onChange={e => setNewTask({...newTask, priority: e.target.value})}
            >
              <option value="LOW">LOW</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="HIGH">HIGH</option>
            </select>
            <button 
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-500 py-4 rounded-2xl font-black transition-all disabled:opacity-50"
            >
              {loading ? "MAILING..." : "ASSIGN TASK"}
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="grid gap-6">
        {tasks.length > 0 ? (
          tasks.map((task) => (
            <motion.div 
              layout key={task.id}
              className="bg-slate-900/50 border border-slate-800 p-8 rounded-[2.5rem] flex flex-col md:flex-row justify-between items-center gap-6"
            >
              <div className="flex gap-6 items-start flex-1">
                <div className={`p-4 rounded-2xl ${task.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-blue-500/10 text-blue-500'}`}>
                  {task.status === 'COMPLETED' ? <CheckCircle2 size={24}/> : <Clock size={24}/>}
                </div>
                <div>
                  <h3 className="text-xl font-black text-white">{task.title}</h3>
                  <div className="flex flex-wrap gap-4 mt-3">
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest bg-slate-800 px-3 py-1 rounded-lg flex items-center gap-2">
                      <User size={12}/> {task.assignedTo}
                    </span>
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest bg-slate-800 px-3 py-1 rounded-lg flex items-center gap-2">
                      <Calendar size={12}/> {task.dueDate}
                    </span>
                    <span className={`text-[9px] font-black px-3 py-1 rounded-lg border ${
                      task.priority === 'HIGH' ? 'text-rose-500 border-rose-500/20 bg-rose-500/10' : 'text-blue-500 border-blue-500/20 bg-blue-500/10'
                    }`}>
                      {task.priority}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {task.status !== 'COMPLETED' && (
                  <button 
                    onClick={() => updateStatus(task.id, task.status)}
                    className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-xl text-xs font-black transition-all"
                  >
                    {task.status === 'PENDING' ? 'START' : 'COMPLETE'}
                  </button>
                )}
                
                {isAdmin && (
                  <button 
                    onClick={() => handleDelete(task.id)}
                    className="p-3 text-rose-500 hover:bg-rose-500 hover:text-white rounded-xl transition-all border border-rose-500/10"
                  >
                    <Trash2 size={20} />
                  </button>
                )}
              </div>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-20 bg-slate-900/20 border border-dashed border-slate-800 rounded-[3rem]">
            <p className="text-slate-600 font-black uppercase tracking-widest italic">No tasks assigned yet</p>
          </div>
        )}
      </div>
    </div>
  );
}