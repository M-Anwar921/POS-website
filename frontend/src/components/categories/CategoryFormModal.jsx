import { useState } from "react";
import { motion } from "framer-motion";
import { FiX } from "react-icons/fi";
import api from "../../api/axios";
import toast from "react-hot-toast";

const colorOptions = ["#2563EB", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899", "#06B6D4", "#84CC16"];

export default function CategoryFormModal({ category, parentOptions, onClose, onSaved }) {
  const [form, setForm] = useState({
    name: category?.name || "",
    color: category?.color || colorOptions[0],
    parent: category?.parent?._id || category?.parent || "",
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, parent: form.parent || null };
      if (category) {
        await api.put(`/categories/${category._id}`, payload);
        toast.success("Category updated");
      } else {
        await api.post("/categories", payload);
        toast.success("Category created");
      }
      onSaved();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save category");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm bg-white dark:bg-[var(--color-card-dark)] rounded-2xl p-5"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold dark:text-white">{category ? "Edit Category" : "Add Category"}</h3>
          <button onClick={onClose}><FiX className="dark:text-white" /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            required
            placeholder="Category name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 text-sm focus:outline-none dark:text-white"
          />

          <select
            value={form.parent}
            onChange={(e) => setForm({ ...form, parent: e.target.value })}
            className="w-full px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 text-sm focus:outline-none dark:text-white"
          >
            <option value="">Top-level category</option>
            {parentOptions.filter((p) => p._id !== category?._id).map((p) => (
              <option key={p._id} value={p._id}>{p.name}</option>
            ))}
          </select>

          <div>
            <p className="text-xs text-[var(--color-muted)] mb-2">Color label</p>
            <div className="flex gap-2 flex-wrap">
              {colorOptions.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setForm({ ...form, color: c })}
                  className={`w-8 h-8 rounded-full ${form.color === c ? "ring-2 ring-offset-2 ring-gray-400 dark:ring-offset-[var(--color-card-dark)]" : ""}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <button type="submit" disabled={saving} className="w-full py-3 rounded-xl text-sm font-semibold bg-[var(--color-primary)] text-white disabled:opacity-60">
            {saving ? "Saving..." : category ? "Update Category" : "Create Category"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}