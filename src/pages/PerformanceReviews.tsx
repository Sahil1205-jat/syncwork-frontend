import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ClipboardCheck, Plus, User, Calendar, Star, Send, X } from "lucide-react";
import toast from "react-hot-toast";

export default function PerformanceReviews() {
    const [reviews, setReviews] = useState<any[]>([]);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [selectedReview, setSelectedReview] = useState<any | null>(null);
    const [newReview, setNewReview] = useState({ empCode: '', period: '', goals: '' });
    const [createLoading, setCreateLoading] = useState(false);
    const [updateLoading, setUpdateLoading] = useState(false);

    // Form state for the modal
    const [assessment, setAssessment] = useState('');
    const [managerFeedback, setManagerFeedback] = useState('');
    const [rating, setRating] = useState(0);
    
    const userRole = localStorage.getItem("user_role");
    const empCode = localStorage.getItem("user_id");
    const isAdmin = userRole === "ADMIN";

    const fetchReviews = async () => {
        const token = localStorage.getItem("auth_token");
        if (!token) return;

        const url = isAdmin 
            ? `http://localhost:8080/api/reviews/all` 
            : `http://localhost:8080/api/reviews/emp/${empCode}`;
        
        try {
            const res = await fetch(url, { headers: { "Authorization": `Bearer ${token}` } });
            if (res.ok) {
                setReviews(await res.json());
            } else {
                toast.error("Failed to fetch reviews.");
            }
        } catch (error) {
            toast.error("Server error fetching reviews.");
        }
    };

    useEffect(() => {
        fetchReviews();
    }, [isAdmin, empCode]);

    // When a review is selected for the modal, populate the form state
    useEffect(() => {
        if (selectedReview) {
            setAssessment(selectedReview.selfAssessment || '');
            setManagerFeedback(selectedReview.managerFeedback || '');
            setRating(selectedReview.rating || 0);
        }
    }, [selectedReview]);

    const getStatusColor = (status: string) => {
        if (status.includes('Pending Self')) return 'bg-amber-500/10 text-amber-500';
        if (status.includes('Pending Manager')) return 'bg-blue-500/10 text-blue-500';
        if (status === 'Completed') return 'bg-emerald-500/10 text-emerald-500';
        return 'bg-slate-700 text-slate-400';
    };

    const handleCreateReview = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreateLoading(true);
        const token = localStorage.getItem("auth_token");
        try {
            const res = await fetch(`http://localhost:8080/api/reviews`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify(newReview)
            });
            if (res.ok) {
                toast.success("Review initiated!");
                setShowCreateForm(false);
                setNewReview({ empCode: '', period: '', goals: '' });
                fetchReviews();
            } else {
                toast.error("Failed to create review.");
            }
        } catch (error) {
            toast.error("Server error during review creation.");
        } finally {
            setCreateLoading(false);
        }
    };

    const handleUpdateReview = async () => {
        if (!selectedReview) return;
        setUpdateLoading(true);
        const token = localStorage.getItem("auth_token");

        let payload = {};
        let newStatus = selectedReview.status;

        if (isAdmin && selectedReview.status === 'Pending Manager Review') {
            payload = { managerFeedback, rating: Number(rating) };
            newStatus = 'Completed';
        } else if (!isAdmin && selectedReview.status === 'Pending Self-Assessment') {
            payload = { selfAssessment: assessment };
            newStatus = 'Pending Manager Review';
        } else {
            setUpdateLoading(false);
            return;
        }

        try {
            const res = await fetch(`http://localhost:8080/api/reviews/${selectedReview.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({ ...payload, status: newStatus })
            });

            if (res.ok) {
                toast.success("Review updated!");
                setSelectedReview(null);
                fetchReviews();
            } else {
                toast.error("Failed to update review.");
            }
        } catch (error) {
            toast.error("Server error while updating review.");
        } finally {
            setUpdateLoading(false);
        }
    };

    return (
        <div className="p-6 lg:p-10 max-w-7xl mx-auto text-slate-200">
            {/* Header */}
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h2 className="text-4xl font-black text-white italic flex items-center gap-3">
                        <ClipboardCheck className="text-purple-500" size={36} /> Performance Reviews
                    </h2>
                    <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.3em] mt-1">Track Growth & Feedback</p>
                </div>
                {isAdmin && (
                    <button onClick={() => setShowCreateForm(!showCreateForm)} className="bg-purple-600 hover:bg-purple-500 px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-purple-600/20 transition-all">
                        <Plus size={20}/> {showCreateForm ? 'CLOSE' : 'NEW REVIEW'}
                    </button>
                )}
            </div>

            {/* Create Review Form */}
            <AnimatePresence>
                {showCreateForm && isAdmin && (
                    <motion.form
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        onSubmit={handleCreateReview}
                        className="bg-black/20 backdrop-blur-lg border border-white/10 rounded-[2rem] p-8 mb-10 grid grid-cols-1 md:grid-cols-2 gap-4"
                    >
                        <input required placeholder="Employee Code (e.g. EMP101)" className="w-full bg-white/5 border-white/10 text-white rounded-xl p-4 outline-none focus:ring-1 focus:ring-purple-400" value={newReview.empCode} onChange={e => setNewReview({...newReview, empCode: e.target.value.toUpperCase()})} />
                        <input required placeholder="Review Period (e.g. Q3 2026)" className="w-full bg-white/5 border-white/10 text-white rounded-xl p-4 outline-none focus:ring-1 focus:ring-purple-400" value={newReview.period} onChange={e => setNewReview({...newReview, period: e.target.value})} />
                        <textarea required placeholder="Initial Goals for this period" className="w-full md:col-span-2 bg-white/5 border-white/10 text-white rounded-xl p-4 outline-none focus:ring-1 focus:ring-purple-400" value={newReview.goals} onChange={e => setNewReview({...newReview, goals: e.target.value})} />
                        <button type="submit" disabled={createLoading} className="md:col-span-2 bg-purple-600 h-14 rounded-xl font-black flex items-center justify-center gap-2 disabled:opacity-50">
                            {createLoading ? "INITIATING..." : <><Send size={18}/> INITIATE REVIEW</>}
                        </button>
                    </motion.form>
                )}
            </AnimatePresence>

            {/* Reviews List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {reviews.map(review => (
                    <motion.div
                        key={review.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * review.id }}
                        className="bg-black/20 backdrop-blur-lg border border-white/10 p-6 rounded-[2rem] hover:border-purple-400/50 transition-all cursor-pointer shadow-lg hover:shadow-purple-500/10"
                        onClick={() => setSelectedReview(review)}
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-lg font-black text-white">{review.empName}</h3>
                                <p className="text-sm text-slate-400 font-bold">{review.period}</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${getStatusColor(review.status)}`}>
                                {review.status}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-500 text-xs font-bold">
                            <User size={14}/> {review.empCode}
                        </div>
                    </motion.div>
                ))}
            </div>
            
            {reviews.length === 0 && (
                <div className="text-center py-20 bg-slate-900/30 border-dashed border-slate-800 rounded-[2rem]">
                    <ClipboardCheck className="mx-auto w-12 h-12 text-slate-700 mb-4" />
                    <p className="text-slate-500 font-black uppercase tracking-widest">No performance reviews found.</p>
                </div>
            )}

            {/* Review Details Modal */}
            <AnimatePresence>
                {selectedReview && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            key="backdrop"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedReview(null)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div 
                            key="modal"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-2xl p-8 w-full max-w-2xl relative"
                        >
                            <button onClick={() => setSelectedReview(null)} className="absolute top-4 right-4 text-slate-500 hover:text-white">
                                <X size={24} />
                            </button>
                            <h3 className="text-2xl font-bold text-white mb-6">Review for {selectedReview.empName} ({selectedReview.period})</h3>
                            
                            <div className="space-y-6">
                                {/* Goals */}
                                <div>
                                    <label className="text-[10px] font-black uppercase text-slate-500">Goals for this Period</label>
                                    <p className="bg-white/5 border border-white/10 rounded-lg p-3 mt-1 text-slate-300">{selectedReview.goals}</p>
                                </div>

                                {/* Self-Assessment Section */}
                                <div>
                                    <label className="text-[10px] font-black uppercase text-slate-500">Employee Self-Assessment</label>
                                    {selectedReview.status === 'Pending Self-Assessment' && !isAdmin ? (
                                        <textarea value={assessment} onChange={(e) => setAssessment(e.target.value)} rows={5} className="w-full mt-1 bg-white/5 border border-white/10 rounded-lg p-3 outline-none focus:ring-1 focus:ring-purple-400" placeholder="Describe your achievements, challenges, and areas for growth..."></textarea>
                                    ) : (
                                        <p className="bg-white/5 border border-white/10 rounded-lg p-3 mt-1 text-slate-300 min-h-[100px]">{selectedReview.selfAssessment || 'Not yet submitted.'}</p>
                                    )}
                                </div>

                                {/* Manager Feedback Section */}
                                <div>
                                    <label className="text-[10px] font-black uppercase text-slate-500">Manager Feedback & Rating</label>
                                    {selectedReview.status === 'Pending Manager Review' && isAdmin ? (
                                        <>
                                            <textarea value={managerFeedback} onChange={(e) => setManagerFeedback(e.target.value)} rows={5} className="w-full mt-1 bg-white/5 border border-white/10 rounded-lg p-3 outline-none focus:ring-1 focus:ring-purple-400" placeholder="Provide constructive feedback..."></textarea>
                                            <div className="flex items-center gap-4 mt-2">
                                                <label className="font-bold">Rating (1-5):</label>
                                                <input type="number" min="1" max="5" value={rating} onChange={e => setRating(Number(e.target.value))} className="w-20 bg-white/5 border-white/10 rounded-lg p-2 outline-none focus:ring-1 focus:ring-purple-400" />
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <p className="bg-slate-950/70 border border-slate-800 rounded-lg p-3 mt-1 text-slate-300 min-h-[100px]">{selectedReview.managerFeedback || 'Not yet submitted.'}</p>
                                            <div className="flex items-center gap-2 mt-2 font-bold text-lg">
                                                <Star className="text-amber-400" /> Rating: {selectedReview.rating > 0 ? `${selectedReview.rating} / 5` : 'N/A'}
                                            </div>
                                        </>
                                    )}
                                </div>

                                {/* Action Buttons */}
                                <div className="pt-6 border-t border-slate-800 flex justify-end">
                                    {((!isAdmin && selectedReview.status === 'Pending Self-Assessment') || (isAdmin && selectedReview.status === 'Pending Manager Review')) && (
                                        <button onClick={handleUpdateReview} disabled={updateLoading} className="bg-purple-600 hover:bg-purple-500 px-6 py-3 rounded-xl font-bold flex items-center gap-2 disabled:opacity-50">
                                            {updateLoading ? "SUBMITTING..." : <><Send size={18} /> SUBMIT</>}
                                        </button>
                                    )}
                                    {selectedReview.status === 'Completed' && (
                                        <span className="text-emerald-500 font-bold flex items-center gap-2"><ClipboardCheck size={20}/> REVIEW COMPLETED</span>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}