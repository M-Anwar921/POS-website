import { useEffect, useState, useCallback } from "react";
import { FiPlus, FiTruck, FiPackage } from "react-icons/fi";
import api from "../api/axios";
import toast from "react-hot-toast";
import PurchaseFormModal from "../components/purchases/PurchaseFormModal";
import ReceiveStockModal from "../components/purchases/ReceiveStockModal";

const statusColors = {
  draft: "bg-gray-100 text-gray-600",
  ordered: "bg-blue-100 text-[var(--color-primary)]",
  partial: "bg-amber-100 text-[var(--color-warning)]",
  received: "bg-emerald-100 text-[var(--color-success)]",
  cancelled: "bg-red-100 text-[var(--color-danger)]",
};

export default function Purchases() {
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [receivingPO, setReceivingPO] = useState(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/purchases", { params: { status: statusFilter } });
      setOrders(res.data.data);
    } catch {
      toast.error("Failed to load purchase orders");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleCancel = async (id) => {
    if (!confirm("Cancel this purchase order?")) return;
    try {
      await api.put(`/purchases/${id}/cancel`);
      toast.success("Purchase order cancelled");
      fetchOrders();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to cancel");
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <h1 className="text-xl font-semibold dark:text-white">Purchases</h1>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-[var(--color-primary)] text-white">
          <FiPlus size={14} /> New Purchase Order
        </button>
      </div>

      <div className="flex gap-2 mb-4">
        {["", "ordered", "partial", "received", "cancelled"].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize ${
              statusFilter === s ? "bg-[var(--color-primary)] text-white" : "bg-white dark:bg-[var(--color-card-dark)] text-[var(--color-muted)] border border-gray-200 dark:border-gray-700"
            }`}
          >
            {s || "All"}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-20 rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse" />)
        ) : orders.length === 0 ? (
          <p className="text-center text-[var(--color-muted)] py-10 text-sm">No purchase orders found</p>
        ) : (
          orders.map((po) => (
            <div key={po._id} className="bg-white dark:bg-[var(--color-card-dark)] rounded-2xl p-4 border border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center">
                  <FiPackage className="text-[var(--color-primary)]" size={18} />
                </div>
                <div>
                  <p className="font-medium dark:text-white">{po.poNumber}</p>
                  <p className="text-xs text-[var(--color-muted)] flex items-center gap-1">
                    <FiTruck size={11} /> {po.supplier?.name} · Rs {po.totalAmount.toFixed(0)} · {po.items.length} items
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${statusColors[po.status]}`}>{po.status}</span>
                {(po.status === "ordered" || po.status === "partial") && (
                  <button onClick={() => setReceivingPO(po)} className="text-xs font-medium text-[var(--color-primary)]">Receive</button>
                )}
                {po.status === "ordered" && (
                  <button onClick={() => handleCancel(po._id)} className="text-xs font-medium text-[var(--color-danger)]">Cancel</button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {showForm && <PurchaseFormModal onClose={() => setShowForm(false)} onSaved={() => { setShowForm(false); fetchOrders(); }} />}
      {receivingPO && (
        <ReceiveStockModal
          po={receivingPO}
          onClose={() => setReceivingPO(null)}
          onSaved={() => { setReceivingPO(null); fetchOrders(); }}
        />
      )}
    </div>
  );
}