import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FiX } from "react-icons/fi";
import api from "../../api/axios";
import toast from "react-hot-toast";

const statusOptions = ["pending", "completed", "cancelled"];

export default function OrderDetailModal({ orderId, onClose, onChanged }) {
  const [order, setOrder] = useState(null);
  const [note, setNote] = useState("");
  const [newStatus, setNewStatus] = useState("");

  const fetchOrder = async () => {
    const res = await api.get(`/orders/${orderId}`);
    setOrder(res.data.data);
  };

  useEffect(() => { fetchOrder(); }, [orderId]);

  const handleStatusChange = async () => {
    if (!newStatus) return;
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus, note });
      toast.success("Order status updated");
      setNote("");
      setNewStatus("");
      fetchOrder();
      onChanged();
    } catch {
      toast.error("Failed to update status");
    }
  };

  if (!order) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md bg-white dark:bg-[var(--color-card-dark)] rounded-2xl overflow-hidden max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <h3 className="font-semibold dark:text-white">{order.orderNumber}</h3>
          <button onClick={onClose}><FiX className="dark:text-white" /></button>
        </div>

        <div className="p-5 overflow-y-auto space-y-4">
          <div className="space-y-1.5">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex justify-between text-sm">
                <span className="dark:text-white">{item.name} × {item.quantity}</span>
                <span className="text-[var(--color-muted)]">Rs {item.lineTotal.toFixed(0)}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between text-sm font-bold border-t border-gray-100 dark:border-gray-800 pt-2">
            <span className="dark:text-white">Total</span>
            <span className="dark:text-white">Rs {order.grandTotal.toFixed(0)}</span>
          </div>

          <div>
            <h4 className="text-sm font-semibold dark:text-white mb-2">Status Timeline</h4>
            <div className="space-y-2">
              {order.statusHistory?.length > 0 ? (
                order.statusHistory.map((h, idx) => (
                  <div key={idx} className="text-xs text-[var(--color-muted)]">
                    <span className="font-medium capitalize dark:text-white">{h.status}</span> — {h.changedBy?.name} · {new Date(h.timestamp).toLocaleString()}
                    {h.note && <p className="italic">{h.note}</p>}
                  </div>
                ))
              ) : (
                <p className="text-xs text-[var(--color-muted)]">Order created — {new Date(order.createdAt).toLocaleString()}</p>
              )}
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 space-y-2">
            <p className="text-xs font-medium dark:text-white">Change status</p>
            <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-white dark:bg-gray-900 text-sm dark:text-white">
              <option value="">Select new status...</option>
              {statusOptions.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <input placeholder="Note (optional)" value={note} onChange={(e) => setNote(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-white dark:bg-gray-900 text-sm dark:text-white" />
            <button onClick={handleStatusChange} className="w-full py-2 rounded-lg text-xs font-semibold bg-[var(--color-primary)] text-white">Update Status</button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}