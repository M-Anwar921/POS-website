import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FiX, FiPlus, FiTrash2 } from "react-icons/fi";
import api from "../../api/axios";
import toast from "react-hot-toast";
import ProductPicker from "../inventory/ProductPicker";

export default function PurchaseFormModal({ onClose, onSaved }) {
  const [suppliers, setSuppliers] = useState([]);
  const [supplier, setSupplier] = useState("");
  const [items, setItems] = useState([]);
  const [expectedDate, setExpectedDate] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get("/suppliers").then((res) => setSuppliers(res.data.data));
  }, []);

  const addItem = (product) => {
    if (!product) return;
    if (items.find((i) => i.product === product._id)) return toast.error("Already added");
    setItems([...items, { product: product._id, name: product.name, quantity: 1, unitCost: product.cost || 0 }]);
  };

  const updateItem = (idx, field, value) => {
    const copy = [...items];
    copy[idx][field] = Number(value);
    setItems(copy);
  };

  const removeItem = (idx) => setItems(items.filter((_, i) => i !== idx));

  const total = items.reduce((sum, i) => sum + i.quantity * i.unitCost, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!supplier) return toast.error("Select a supplier");
    if (items.length === 0) return toast.error("Add at least one item");
    setSaving(true);
    try {
      await api.post("/purchases", { supplier, items, expectedDate: expectedDate || null, notes });
      toast.success("Purchase order created");
      onSaved();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create purchase order");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-lg bg-white dark:bg-[var(--color-card-dark)] rounded-2xl overflow-hidden max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <h3 className="font-semibold dark:text-white">New Purchase Order</h3>
          <button onClick={onClose}><FiX className="dark:text-white" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4">
          <select required value={supplier} onChange={(e) => setSupplier(e.target.value)} className="w-full px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 text-sm focus:outline-none dark:text-white">
            <option value="">Select supplier</option>
            {suppliers.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
          </select>

          <ProductPicker value={null} onChange={addItem} />

          <div className="space-y-2">
            {items.map((item, idx) => (
              <div key={item.product} className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 rounded-xl p-2">
                <span className="flex-1 text-sm dark:text-white truncate">{item.name}</span>
                <input type="number" min="1" value={item.quantity} onChange={(e) => updateItem(idx, "quantity", e.target.value)} className="w-16 px-2 py-1 rounded-lg bg-white dark:bg-gray-900 text-sm dark:text-white" placeholder="Qty" />
                <input type="number" min="0" step="0.01" value={item.unitCost} onChange={(e) => updateItem(idx, "unitCost", e.target.value)} className="w-20 px-2 py-1 rounded-lg bg-white dark:bg-gray-900 text-sm dark:text-white" placeholder="Cost" />
                <button type="button" onClick={() => removeItem(idx)} className="text-[var(--color-danger)]"><FiTrash2 size={14} /></button>
              </div>
            ))}
          </div>

          {items.length > 0 && (
            <p className="text-right text-sm font-semibold dark:text-white">Total: Rs {total.toFixed(0)}</p>
          )}

          <input type="date" value={expectedDate} onChange={(e) => setExpectedDate(e.target.value)} className="w-full px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 text-sm focus:outline-none dark:text-white" />
          <textarea placeholder="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="w-full px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 text-sm focus:outline-none dark:text-white resize-none" />

          <button type="submit" disabled={saving} className="w-full py-3 rounded-xl text-sm font-semibold bg-[var(--color-primary)] text-white disabled:opacity-60">
            {saving ? "Creating..." : "Create Purchase Order"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}