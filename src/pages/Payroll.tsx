import { useState, useEffect } from "react";
import { Banknote, FileDown, User, ShieldCheck, Edit3, Check, X } from "lucide-react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import toast from "react-hot-toast";

export default function Payroll() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [tempCtc, setTempCtc] = useState("");
  const [loading, setLoading] = useState(true);

  const userRole = localStorage.getItem("user_role") || "EMPLOYEE";
  const loggedInEmpCode = localStorage.getItem("user_id") || ""; 
  const isAdmin = userRole === "ADMIN";

  const fetchData = async () => {
    setLoading(true);
    try {
      const url = isAdmin 
        ? "http://localhost:8080/api/employees" 
        : `http://localhost:8080/api/employees/code/${loggedInEmpCode}`;
      
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setEmployees(Array.isArray(data) ? data : (data ? [data] : []));
      }
    } catch (error) {
      toast.error("DB Connection Failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [isAdmin, loggedInEmpCode]);

  const saveCTC = async (id: number) => {
    try {
      const res = await fetch(`http://localhost:8080/api/employees/${id}/ctc`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Number(tempCtc))
      });
      if (res.ok) {
        toast.success("CTC Updated!");
        setEditingId(null);
        fetchData();
      }
    } catch (error) {
      toast.error("Update failed");
    }
  };

  const generatePDF = (emp: any) => {
    try {
      const doc = new jsPDF();
      const ctc = Number(emp?.ctc) || 0;
      const tax = Math.round(ctc * 0.10);
      const net = ctc - tax;

      // Header
      doc.setFontSize(22);
      doc.setTextColor(37, 99, 235);
      doc.text("SYNCWORK ENTERPRISES", 105, 20, { align: "center" });
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text("Salary Slip - Monthly Statement", 105, 28, { align: "center" });
      doc.line(14, 35, 196, 35);

      // Details
      doc.setFontSize(11);
      doc.setTextColor(0);
      doc.text(`Employee Name : ${emp.name || 'N/A'}`, 14, 45);
      doc.text(`Employee ID   : ${(emp.empCode || 'N/A').toUpperCase()}`, 14, 53);
      doc.text(`Email         : ${emp.email || 'N/A'}`, 14, 61);
      doc.text(`Department    : ${emp.department || 'N/A'}`, 115, 45);
      doc.text(`Joining Date   : ${emp.hireDate || 'N/A'}`, 115, 53);

      // Table Logic
      autoTable(doc, {
        startY: 70,
        head: [['Description', 'Earnings', 'Deductions']],
        body: [
          ['Monthly Base Package', `Rs. ${ctc}`, '-'],
          ['Income Tax (TDS 10%)', '-', `Rs. ${tax}`],
          ['', '', ''],
        ],
        foot: [['Take Home Salary', '', `Rs. ${net}/-`]],
        theme: 'grid',
        headStyles: { fillColor: [37, 99, 235] },
        footStyles: { fillColor: [241, 245, 249], textColor: [0, 0, 0] }
      });

      doc.save(`${emp.empCode}_Payslip.pdf`);
      toast.success("Download Started!");
    } catch (err) {
      toast.error("PDF Generation Failed");
      console.error(err);
    }
  };

  return (
    <div className="p-6 lg:p-10 text-slate-200">
      <div className="max-w-6xl mx-auto mb-10">
        <h2 className="text-4xl font-black text-white flex items-center gap-3 italic">
          <Banknote className="w-10 h-10 text-emerald-500" /> Payroll Console
        </h2>
        <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.3em]">
          {isAdmin ? "Admin: Salary Management" : "My Compensation Details"}
        </p>
      </div>

      <div className="max-w-6xl mx-auto bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl">
        {loading ? <div className="text-center py-10 animate-pulse">Loading Data...</div> : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500 uppercase text-[10px] font-black tracking-widest">
                <th className="pb-4 pl-4">Staff Member</th>
                <th className="pb-4">Monthly CTC</th>
                <th className="pb-4 text-right pr-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => (
                <tr key={emp.id} className="border-b border-slate-800/50 hover:bg-slate-800/20">
                  <td className="py-5 pl-4">
                    <div className="font-bold text-white">{emp.name}</div>
                    <div className="text-xs text-slate-500 uppercase">{emp.empCode}</div>
                  </td>
                  <td className="py-5">
                    {isAdmin ? (
                      editingId === emp.id ? (
                        <div className="flex items-center gap-2">
                          <input type="number" className="w-24 bg-slate-950 border border-emerald-500 rounded px-2 h-8" value={tempCtc} onChange={e => setTempCtc(e.target.value)} />
                          <button onClick={() => saveCTC(emp.id)} className="text-emerald-500"><Check size={18}/></button>
                          <button onClick={() => setEditingId(null)} className="text-rose-500"><X size={18}/></button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 font-mono text-emerald-400 group">
                          ₹{emp.ctc || 0}
                          <button onClick={() => {setEditingId(emp.id); setTempCtc(emp.ctc || "0")}} className="opacity-0 group-hover:opacity-100"><Edit3 size={14}/></button>
                        </div>
                      )
                    ) : ( <div className="font-mono text-emerald-400">₹{emp.ctc || 0}</div> )}
                  </td>
                  <td className="py-5 text-right pr-4">
                    <button onClick={() => generatePDF(emp)} className="bg-blue-600 px-4 py-2 rounded-xl font-bold text-xs hover:bg-blue-500 transition-all">
                      <FileDown className="inline mr-2 w-4 h-4" /> DOWNLOAD SLIP
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}