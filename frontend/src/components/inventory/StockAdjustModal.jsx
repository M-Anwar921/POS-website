import { useState } from "react";
import { motion } from "framer-motion";
import { FiX } from "react-icons/fi";
import api from "../../api/axios";
import toast from "react-hot-toast";
import ProductPicker from "./ProductPicker";

export default function StockAdjustModal({ warehouses, onClose, onSaved }) {
  const [product, setProduct] = useState(null);
  const [form, setForm] = useState({
    warehouse: warehouses[0]?._id || "",
    quantity: "",
    type: "in",
    batchNumber: "",
    expiryDate: "",
    reason: "",
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!product) return toast.error("Select a product first");
    setSaving(true);
    try {
      await api.post("/inventory/adjust", {
        product: product._id,
        warehouse: form.warehouse,
        quantity: Number(form.quantity),
        type: form.type,
        batchNumber: form.batchNumber,
        expiryDate: form.expiryDate || null,
        reason: form.reason,
      });
      toast.success("Stock adjusted");
      onSaved();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to adjust stock");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-sm bg-white dark:bg-[var(--color-card-dark)] rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold dark:text-white">Adjust Stock</h3>
          <button onClick={onClose}><FiX className="dark:text-white" /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <ProductPicker value={product} onChange={setProduct} />

          <select value={form.warehouse} onChange={(e) => setForm({ ...form, warehouse: e.target.value })} className="w-full px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 text-sm focus:outline-none dark:text-white">
            {warehouses.map((w) => <option key={w._id} value={w._id}>{w.name}</option>)}
          </select>

          <div className="grid grid-cols-2 gap-2">
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 text-sm focus:outline-none dark:text-white">
              <option value="in">Stock In</option>
              <option value="out">Stock Out</option>
              <option value="adjustment">Correction</option>
            </select>
            <input required type="number" min="1" placeholder="Quantity" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} className="px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 text-sm focus:outline-none dark:text-white" />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <input placeholder="Batch # (optional)" value={form.batchNumber} onChange={(e) => setForm({ ...form, batchNumber: e.target.value })} className="px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 text-sm focus:outline-none dark:text-white" />
            <input type="date" value={form.expiryDate} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} className="px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 text-sm focus:outline-none dark:text-white" />
          </div>

          <textarea placeholder="Reason / notes" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} rows={2} className="w-full px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 text-sm focus:outline-none dark:text-white resize-none" />

          <button type="submit" disabled={saving} className="w-full py-3 rounded-xl text-sm font-semibold bg-[var(--color-primary)] text-white disabled:opacity-60">
            {saving ? "Saving..." : "Apply Adjustment"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}