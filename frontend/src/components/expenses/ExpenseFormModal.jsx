import { useState } from "react";
import { motion } from "framer-motion";
import { FiX } from "react-icons/fi";
import api from "../../api/axios";
import toast from "react-hot-toast";

const categories = ["Utilities", "Rent", "Salary", "Transportation", "Marketing", "Maintenance", "Other"];

export default function ExpenseFormModal({ onClose, onSaved }) {
  const [form, setForm] = useState({
    category: "Utilities",
    customCategory: "",
    amount: "",
    description: "",
    date: new Date().toISOString().slice(0, 10),
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.category === "Other" && !form.customCategory.trim()) {
      return toast.error("Please name the custom category");
    }
    setSaving(true);
    try {
      await api.post("/expenses", { ...form, amount: Number(form.amount) });
      toast.success("Expense recorded");
      onSaved();
    } catch {
      toast.error("Failed to record expense");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-sm bg-white dark:bg-[var(--color-card-dark)] rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold dark:text-white">Add Expense</h3>
          <button onClick={onClose}><FiX className="dark:text-white" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 text-sm focus:outline-none dark:text-white">
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>

          {form.category === "Other" && (
            <input placeholder="Custom category name" value={form.customCategory} onChange={(e) => setForm({ ...form, customCategory: e.target.value })} className="w-full px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 text-sm focus:outline-none dark:text-white" />
          )}

          <input required type="number" step="0.01" placeholder="Amount" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="w-full px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 text-sm focus:outline-none dark:text-white" />
          <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="w-full px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 text-sm focus:outline-none dark:text-white" />
          <textarea placeholder="Description (optional)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="w-full px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 text-sm focus:outline-none dark:text-white resize-none" />

          <button type="submit" disabled={saving} className="w-full py-3 rounded-xl text-sm font-semibold bg-[var(--color-primary)] text-white disabled:opacity-60">
            {saving ? "Saving..." : "Add Expense"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}