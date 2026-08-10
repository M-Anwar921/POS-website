import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FiX, FiStar, FiDollarSign, FiEdit2 } from "react-icons/fi";
import api from "../../api/axios";
import toast from "react-hot-toast";

export default function CustomerDetailModal({ customerId, onClose, onChanged }) {
  const [customer, setCustomer] = useState(null);
  const [editingNotes, setEditingNotes] = useState(false);
  const [notes, setNotes] = useState("");
  const [loyaltyDelta, setLoyaltyDelta] = useState("");
  const [creditForm, setCreditForm] = useState({ amount: "", type: "charge" });

  const fetchCustomer = async () => {
    const res = await api.get(`/customers/${customerId}`);
    setCustomer(res.data.data);
    setNotes(res.data.data.notes || "");
  };

  useEffect(() => { fetchCustomer(); }, [customerId]);

  const handleLoyaltyAdjust = async (sign) => {
    if (!loyaltyDelta) return;
    try {
      await api.post(`/customers/${customerId}/loyalty`, { points: sign * Number(loyaltyDelta) });
      toast.success("Loyalty points updated");
      setLoyaltyDelta("");
      fetchCustomer();
      onChanged();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed");
    }
  };

  const handleCreditAdjust = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/customers/${customerId}/credit`, creditForm);
      toast.success("Balance updated");
      setCreditForm({ amount: "", type: "charge" });
      fetchCustomer();
      onChanged();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed");
    }
  };

  const handleSaveNotes = async () => {
    try {
      await api.put(`/customers/${customerId}`, { notes });
      toast.success("Notes saved");
      setEditingNotes(false);
      fetchCustomer();
    } catch {
      toast.error("Failed to save notes");
    }
  };

  if (!customer) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-lg bg-white dark:bg-[var(--color-card-dark)] rounded-2xl overflow-hidden max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <div>
            <h3 className="font-semibold dark:text-white">{customer.name}</h3>
            <p className="text-xs text-[var(--color-muted)]">{customer.phone} · {customer.email}</p>
          </div>
          <button onClick={onClose}><FiX className="dark:text-white" /></button>
        </div>

        <div className="p-5 overflow-y-auto space-y-5">
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 text-center">
              <p className="text-lg font-bold dark:text-white">{customer.orderCount}</p>
              <p className="text-xs text-[var(--color-muted)]">Orders</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 text-center">
              <p className="text-lg font-bold dark:text-white">Rs {customer.totalSpent.toFixed(0)}</p>
              <p className="text-xs text-[var(--color-muted)]">Total Spent</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 text-center">
              <p className={`text-lg font-bold ${customer.creditBalance > 0 ? "text-[var(--color-danger)]" : "dark:text-white"}`}>Rs {customer.creditBalance.toFixed(0)}</p>
              <p className="text-xs text-[var(--color-muted)]">Outstanding</p>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold dark:text-white mb-2 flex items-center gap-1.5">
              <FiStar className="text-[var(--color-warning)]" size={14} /> Loyalty Points: {customer.loyaltyPoints}
            </h4>
            <div className="flex gap-2">
              <input type="number" placeholder="Points" value={loyaltyDelta} onChange={(e) => setLoyaltyDelta(e.target.value)} className="flex-1 px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-800 text-sm focus:outline-none dark:text-white" />
              <button onClick={() => handleLoyaltyAdjust(1)} className="px-3 py-2 rounded-lg text-xs font-medium bg-emerald-50 text-[var(--color-success)]">Add</button>
              <button onClick={() => handleLoyaltyAdjust(-1)} className="px-3 py-2 rounded-lg text-xs font-medium bg-red-50 text-[var(--color-danger)]">Redeem</button>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold dark:text-white mb-2 flex items-center gap-1.5">
              <FiDollarSign className="text-[var(--color-primary)]" size={14} /> Credit / Outstanding Balance
            </h4>
            <form onSubmit={handleCreditAdjust} className="flex gap-2">
              <select value={creditForm.type} onChange={(e) => setCreditForm({ ...creditForm, type: e.target.value })} className="px-2 py-2 rounded-lg bg-gray-50 dark:bg-gray-800 text-xs focus:outline-none dark:text-white">
                <option value="charge">Charge</option>
                <option value="payment">Payment</option>
              </select>
              <input required type="number" placeholder="Amount" value={creditForm.amount} onChange={(e) => setCreditForm({ ...creditForm, amount: e.target.value })} className="flex-1 px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-800 text-sm focus:outline-none dark:text-white" />
              <button type="submit" className="px-3 py-2 rounded-lg text-xs font-medium bg-[var(--color-primary)] text-white">Apply</button>
            </form>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold dark:text-white">Notes</h4>
              <button onClick={() => (editingNotes ? handleSaveNotes() : setEditingNotes(true))} className="text-xs text-[var(--color-primary)] flex items-center gap-1">
                <FiEdit2 size={11} /> {editingNotes ? "Save" : "Edit"}
              </button>
            </div>
            {editingNotes ? (
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-800 text-sm focus:outline-none dark:text-white resize-none" />
            ) : (
              <p className="text-sm text-[var(--color-muted)]">{customer.notes || "No notes yet"}</p>
            )}
          </div>

          <div>
            <h4 className="text-sm font-semibold dark:text-white mb-2">Purchase History</h4>
            {customer.orders.length === 0 ? (
              <p className="text-xs text-[var(--color-muted)]">No orders yet</p>
            ) : (
              <div className="space-y-1.5">
                {customer.orders.map((o) => (
                  <div key={o._id} className="flex justify-between text-xs border-b border-gray-50 dark:border-gray-800/50 pb-1.5">
                    <span className="dark:text-white">{o.orderNumber} · {new Date(o.createdAt).toLocaleDateString()}</span>
                    <span className="font-medium dark:text-white">Rs {o.grandTotal.toFixed(0)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}