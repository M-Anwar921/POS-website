import { useEffect, useState, useCallback } from "react";
import { FiClock } from "react-icons/fi";
import api from "../api/axios";
import toast from "react-hot-toast";
import OrderDetailModal from "../components/orders/OrderDetailModal";

const statusColors = {
  held: "bg-gray-100 text-gray-600",
  pending: "bg-amber-100 text-[var(--color-warning)]",
  completed: "bg-emerald-100 text-[var(--color-success)]",
  cancelled: "bg-red-100 text-[var(--color-danger)]",
  refunded: "bg-purple-100 text-purple-600",
  partially_refunded: "bg-purple-100 text-purple-600",
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/orders", { params: { status: statusFilter } });
      setOrders(res.data.data);
    } catch {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  return (
    <div>
      <h1 className="text-xl font-semibold dark:text-white mb-6">Orders</h1>

      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {["", "completed", "cancelled", "refunded", "partially_refunded"].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap capitalize ${
              statusFilter === s ? "bg-[var(--color-primary)] text-white" : "bg-white dark:bg-[var(--color-card-dark)] text-[var(--color-muted)] border border-gray-200 dark:border-gray-700"
            }`}
          >
            {s ? s.replace("_", " ") : "All"}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-[var(--color-card-dark)] rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800 text-left text-[var(--color-muted)]">
                <th className="px-4 py-3 font-medium">Order #</th>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Cashier</th>
                <th className="px-4 py-3 font-medium">Total</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => <tr key={i}><td colSpan={6} className="px-4 py-4"><div className="h-4 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" /></td></tr>)
              ) : orders.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-10 text-[var(--color-muted)]">No orders found</td></tr>
              ) : (
                orders.map((o) => (
                  <tr key={o._id} onClick={() => setSelectedOrder(o)} className="border-b border-gray-50 dark:border-gray-800/50 cursor-pointer hover:bg-gray-50/50 dark:hover:bg-gray-800/30">
                    <td className="px-4 py-3 font-medium dark:text-white">{o.orderNumber}</td>
                    <td className="px-4 py-3 text-[var(--color-muted)]">{o.customer?.name || "Walk-in"}</td>
                    <td className="px-4 py-3 text-[var(--color-muted)]">{o.cashier?.name}</td>
                    <td className="px-4 py-3 dark:text-white">Rs {o.grandTotal.toFixed(0)}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${statusColors[o.status]}`}>
                        {o.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[var(--color-muted)] flex items-center gap-1">
                      <FiClock size={11} /> {new Date(o.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedOrder && (
        <OrderDetailModal
          orderId={selectedOrder._id}
          onClose={() => setSelectedOrder(null)}
          onChanged={fetchOrders}
        />
      )}
    </div>
  );
}