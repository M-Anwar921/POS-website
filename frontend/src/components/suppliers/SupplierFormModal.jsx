import { useState } from "react";
import { motion } from "framer-motion";
import { FiX } from "react-icons/fi";
import api from "../../api/axios";
import toast from "react-hot-toast";

export default function SupplierFormModal({ onClose, onSaved }) {
  const [form, setForm] = useState({ name: "", contactPerson: "", phone: "", email: "", address: "", notes: "" });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post("/suppliers", form);
      toast.success("Supplier added");
      onSaved();
    } catch {
      toast.error("Failed to add supplier");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-sm bg-white dark:bg-[var(--color-card-dark)] rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold dark:text-white">Add Supplier</h3>
          <button onClick={onClose}><FiX className="dark:text-white" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input required placeholder="Supplier name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 text-sm focus:outline-none dark:text-white" />
          <input placeholder="Contact person" value={form.contactPerson} onChange={(e) => setForm({ ...form, contactPerson: e.target.value })} className="w-full px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 text-sm focus:outline-none dark:text-white" />
          <input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 text-sm focus:outline-none dark:text-white" />
          <input placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 text-sm focus:outline-none dark:text-white" />
          <input placeholder="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="w-full px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 text-sm focus:outline-none dark:text-white" />
          <textarea placeholder="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} className="w-full px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 text-sm focus:outline-none dark:text-white resize-none" />
          <button type="submit" disabled={saving} className="w-full py-3 rounded-xl text-sm font-semibold bg-[var(--color-primary)] text-white disabled:opacity-60">
            {saving ? "Saving..." : "Add Supplier"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}