import { useState } from "react";
import { motion } from "framer-motion";
import { FiX, FiArrowRight } from "react-icons/fi";
import api from "../../api/axios";
import toast from "react-hot-toast";
import ProductPicker from "./ProductPicker";

export default function StockTransferModal({ warehouses, onClose, onSaved }) {
  const [product, setProduct] = useState(null);
  const [form, setForm] = useState({
    fromWarehouse: warehouses[0]?._id || "",
    toWarehouse: warehouses[1]?._id || "",
    quantity: "",
    batchNumber: "",
    reason: "",
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!product) return toast.error("Select a product first");
    if (form.fromWarehouse === form.toWarehouse) return toast.error("Source and destination must differ");
    setSaving(true);
    try {
      await api.post("/inventory/transfer", { ...form, product: product._id, quantity: Number(form.quantity) });
      toast.success("Stock transferred");
      onSaved();
    } catch (error) {
      toast.error(error.response?.data?.message || "Transfer failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-sm bg-white dark:bg-[var(--color-card-dark)] rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold dark:text-white">Transfer Stock</h3>
          <button onClick={onClose}><FiX className="dark:text-white" /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <ProductPicker value={product} onChange={setProduct} />

          <div className="flex items-center gap-2">
            <select value={form.fromWarehouse} onChange={(e) => setForm({ ...form, fromWarehouse: e.target.value })} className="flex-1 px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 text-sm focus:outline-none dark:text-white">
              {warehouses.map((w) => <option key={w._id} value={w._id}>{w.name}</option>)}
            </select>
            <FiArrowRight className="text-[var(--color-muted)] shrink-0" />
            <select value={form.toWarehouse} onChange={(e) => setForm({ ...form, toWarehouse: e.target.value })} className="flex-1 px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 text-sm focus:outline-none dark:text-white">
              {warehouses.map((w) => <option key={w._id} value={w._id}>{w.name}</option>)}
            </select>
          </div>

          <input required type="number" min="1" placeholder="Quantity" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} className="w-full px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 text-sm focus:outline-none dark:text-white" />
          <input placeholder="Batch # (optional)" value={form.batchNumber} onChange={(e) => setForm({ ...form, batchNumber: e.target.value })} className="w-full px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 text-sm focus:outline-none dark:text-white" />
          <textarea placeholder="Reason / notes" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} rows={2} className="w-full px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 text-sm focus:outline-none dark:text-white resize-none" />

          <button type="submit" disabled={saving} className="w-full py-3 rounded-xl text-sm font-semibold bg-[var(--color-primary)] text-white disabled:opacity-60">
            {saving ? "Transferring..." : "Confirm Transfer"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}