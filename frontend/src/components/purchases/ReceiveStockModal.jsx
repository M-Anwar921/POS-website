import { useState } from "react";
import { motion } from "framer-motion";
import { FiX } from "react-icons/fi";
import api from "../../api/axios";
import toast from "react-hot-toast";

export default function ReceiveStockModal({ po, onClose, onSaved }) {
  const [warehouse, setWarehouse] = useState("");
  const [warehouses, setWarehouses] = useState([]);
  const [quantities, setQuantities] = useState(
    po.items.reduce((acc, i) => ({ ...acc, [i.product]: i.quantity - i.receivedQuantity }), {})
  );
  const [saving, setSaving] = useState(false);

  useState(() => {
    api.get("/warehouses").then((res) => setWarehouses(res.data.data));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!warehouse) return toast.error("Select a warehouse");
    setSaving(true);
    try {
      const items = po.items
        .filter((i) => quantities[i.product] > 0)
        .map((i) => ({ product: i.product, quantity: Number(quantities[i.product]) }));

      await api.post(`/purchases/${po._id}/receive`, { warehouse, items });
      toast.success("Stock received");
      onSaved();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to receive stock");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md bg-white dark:bg-[var(--color-card-dark)] rounded-2xl overflow-hidden max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <h3 className="font-semibold dark:text-white">Receive Stock — {po.poNumber}</h3>
          <button onClick={onClose}><FiX className="dark:text-white" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-3">
          <select required value={warehouse} onChange={(e) => setWarehouse(e.target.value)} className="w-full px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 text-sm focus:outline-none dark:text-white">
            <option value="">Receive into warehouse...</option>
            {warehouses.map((w) => <option key={w._id} value={w._id}>{w.name}</option>)}
          </select>

          <div className="space-y-2">
            {po.items.map((item) => {
              const remaining = item.quantity - item.receivedQuantity;
              return (
                <div key={item.product} className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
                  <div className="flex-1">
                    <p className="text-sm font-medium dark:text-white">{item.name}</p>
                    <p className="text-xs text-[var(--color-muted)]">{item.receivedQuantity}/{item.quantity} received</p>
                  </div>
                  <input
                    type="number" min="0" max={remaining}
                    value={quantities[item.product]}
                    onChange={(e) => setQuantities({ ...quantities, [item.product]: e.target.value })}
                    disabled={remaining === 0}
                    className="w-20 px-2 py-1.5 rounded-lg bg-white dark:bg-gray-900 text-sm text-center dark:text-white disabled:opacity-40"
                  />
                </div>
              );
            })}
          </div>

          <button type="submit" disabled={saving} className="w-full py-3 rounded-xl text-sm font-semibold bg-[var(--color-primary)] text-white disabled:opacity-60">
            {saving ? "Receiving..." : "Confirm Receipt"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}