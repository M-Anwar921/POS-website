import { useEffect, useState, useCallback } from "react";
import { FiPlus, FiCheck, FiX as FiReject } from "react-icons/fi";
import { useSelector } from "react-redux";
import api from "../api/axios";
import toast from "react-hot-toast";
import ReturnFormModal from "../components/returns/ReturnFormModal";

const statusColors = {
  pending: "bg-amber-100 text-[var(--color-warning)]",
  approved: "bg-emerald-100 text-[var(--color-success)]",
  rejected: "bg-red-100 text-[var(--color-danger)]",
};

export default function Returns() {
  const { user } = useSelector((s) => s.auth);
  const canApprove = ["admin", "manager"].includes(user?.role);
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const fetchReturns = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/returns");
      setReturns(res.data.data);
    } catch {
      toast.error("Failed to load returns");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchReturns(); }, [fetchReturns]);

  const handleApprove = async (id) => {
    try {
      await api.put(`/returns/${id}/approve`);
      toast.success("Return approved and stock restocked");
      fetchReturns();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to approve");
    }
  };

  const handleReject = async (id) => {
    try {
      await api.put(`/returns/${id}/reject`);
      toast.success("Return rejected");
      fetchReturns();
    } catch {
      toast.error("Failed to reject");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold dark:text-white">Returns</h1>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-[var(--color-primary)] text-white">
          <FiPlus size={14} /> New Return
        </button>
      </div>

      <div className="space-y-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-20 rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse" />)
        ) : returns.length === 0 ? (
          <p className="text-center text-[var(--color-muted)] py-10 text-sm">No returns yet</p>
        ) : (
          returns.map((r) => (
            <div key={r._id} className="bg-white dark:bg-[var(--color-card-dark)] rounded-2xl p-4 border border-gray-100 dark:border-gray-800">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="font-medium dark:text-white">Order {r.order?.orderNumber}</p>
                  <p className="text-xs text-[var(--color-muted)] capitalize">{r.type} · Rs {r.refundAmount.toFixed(0)} · by {r.requestedBy?.name}</p>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${statusColors[r.status]}`}>{r.status}</span>
              </div>
              <p className="text-sm text-[var(--color-muted)] mb-1">Reason: {r.reason}</p>
              {r.status === "pending" && canApprove && (
                <div className="flex gap-2 mt-3">
                  <button onClick={() => handleApprove(r._id)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-50 text-[var(--color-success)]">
                    <FiCheck size={12} /> Approve
                  </button>
                  <button onClick={() => handleReject(r._id)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-50 text-[var(--color-danger)]">
                    <FiReject size={12} /> Reject
                  </button>
                </div>
              )}
              {r.status === "pending" && !canApprove && (
                <p className="text-xs text-[var(--color-muted)] italic mt-2">Awaiting manager/admin approval</p>
              )}
            </div>
          ))
        )}
      </div>

      {showForm && <ReturnFormModal onClose={() => setShowForm(false)} onSaved={() => { setShowForm(false); fetchReturns(); }} />}
    </div>
  );
}