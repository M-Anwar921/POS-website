import { useState } from "react";
import { motion } from "framer-motion";
import { FiX, FiSearch } from "react-icons/fi";
import api from "../../api/axios";
import toast from "react-hot-toast";

export default function ReturnFormModal({ onClose, onSaved }) {
  const [orderNumber, setOrderNumber] = useState("");
  const [order, setOrder] = useState(null);
  const [selectedItems, setSelectedItems] = useState({});
  const [reason, setReason] = useState("");
  const [type, setType] = useState("refund");
  const [saving, setSaving] = useState(false);

  const handleFindOrder = async () => {
    try {
      const res = await api.get("/orders", { params: { status: "completed" } });
      const match = res.data.data.find((o) => o.orderNumber.toLowerCase() === orderNumber.toLowerCase());
      if (!match) return toast.error("Order not found");
      const full = await api.get(`/orders/${match._id}`);
      setOrder(full.data.data);
    } catch {
      toast.error("Failed to find order");
    }
  };

  const toggleItem = (item) => {
    setSelectedItems((prev) => {
      const copy = { ...prev };
      if (copy[item.product]) delete copy[item.product];
      else copy[item.product] = { product: item.product, name: item.name, price: item.price, quantity: 1, maxQty: item.quantity };
      return copy;
    });
  };

  const updateQty = (productId, qty) => {
    setSelectedItems((prev) => ({ ...prev, [productId]: { ...prev[productId], quantity: Number(qty) } }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const items = Object.values(selectedItems);
    if (items.length === 0) return toast.error("Select at least one item to return");
    setSaving(true);
    try {
      await api.post("/returns", { order: order._id, items, reason, type });
      toast.success("Return request submitted");
      onSaved();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit return");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md bg-white dark:bg-[var(--color-card-dark)] rounded-2xl overflow-hidden max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <h3 className="font-semibold dark:text-white">New Return</h3>
          <button onClick={onClose}><FiX className="dark:text-white" /></button>
        </div>

        <div className="p-5 overflow-y-auto space-y-4">
          {!order ? (
            <div className="flex gap-2">
              <input placeholder="Enter order number (e.g. ORD-...)" value={orderNumber} onChange={(e) => setOrderNumber(e.target.value)} className="flex-1 px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 text-sm focus:outline-none dark:text-white" />
              <button onClick={handleFindOrder} className="px-4 py-2.5 rounded-xl bg-[var(--color-primary)] text-white">
                <FiSearch size={16} />
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <p className="text-sm font-medium dark:text-white">{order.orderNumber} — select items to return</p>
              {order.items.map((item) => (
                <div key={item.product} className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 rounded-xl p-2">
                  <input type="checkbox" checked={!!selectedItems[item.product]} onChange={() => toggleItem(item)} />
                  <span className="flex-1 text-sm dark:text-white truncate">{item.name} (max {item.quantity})</span>
                  {selectedItems[item.product] && (
                    <input
                      type="number" min="1" max={item.quantity}
                      value={selectedItems[item.product].quantity}
                      onChange={(e) => updateQty(item.product, e.target.value)}
                      className="w-16 px-2 py-1 rounded-lg bg-white dark:bg-gray-900 text-sm dark:text-white"
                    />
                  )}
                </div>
              ))}

              <select value={type} onChange={(e) => setType(e.target.value)} className="w-full px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 text-sm focus:outline-none dark:text-white">
                <option value="refund">Refund</option>
                <option value="exchange">Exchange</option>
              </select>

              <textarea required placeholder="Reason for return" value={reason} onChange={(e) => setReason(e.target.value)} rows={2} className="w-full px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 text-sm focus:outline-none dark:text-white resize-none" />

              <button type="submit" disabled={saving} className="w-full py-3 rounded-xl text-sm font-semibold bg-[var(--color-primary)] text-white disabled:opacity-60">
                {saving ? "Submitting..." : "Submit Return Request"}
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}