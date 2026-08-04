import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FiX, FiSearch, FiUserPlus } from "react-icons/fi";
import api from "../../api/axios";
import toast from "react-hot-toast";

export default function CustomerSearch({ onClose, onSelect }) {
  const [search, setSearch] = useState("");
  const [customers, setCustomers] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ name: "", phone: "" });

  useEffect(() => {
    const t = setTimeout(() => {
      api.get("/customers", { params: { search } }).then((res) => setCustomers(res.data.data));
    }, 250);
    return () => clearTimeout(t);
  }, [search]);

  const handleAdd = async () => {
    if (!newCustomer.name.trim()) return toast.error("Name is required");
    try {
      const res = await api.post("/customers", newCustomer);
      onSelect(res.data.data);
    } catch {
      toast.error("Failed to add customer");
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
          <h3 className="font-semibold dark:text-white">Select Customer</h3>
          <button onClick={onClose}><FiX className="dark:text-white" /></button>
        </div>

        <button
          onClick={() => onSelect(null)}
          className="w-full text-left px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 text-sm mb-2 dark:text-white"
        >
          Walk-in Customer
        </button>

        {!showAdd ? (
          <>
            <div className="relative mb-3">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or phone"
                className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 text-sm focus:outline-none dark:text-white"
              />
            </div>
            <div className="max-h-52 overflow-y-auto space-y-1">
              {customers.map((c) => (
                <button
                  key={c._id}
                  onClick={() => onSelect(c)}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 text-sm dark:text-white"
                >
                  <p className="font-medium">{c.name}</p>
                  <p className="text-xs text-[var(--color-muted)]">{c.phone}</p>
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowAdd(true)}
              className="w-full flex items-center justify-center gap-2 mt-3 py-2.5 rounded-xl text-sm font-medium text-[var(--color-primary)] border border-dashed border-[var(--color-primary)]"
            >
              <FiUserPlus size={14} /> Add New Customer
            </button>
          </>
        ) : (
          <div className="space-y-3">
            <input
              placeholder="Name"
              value={newCustomer.name}
              onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 text-sm focus:outline-none dark:text-white"
            />
            <input
              placeholder="Phone"
              value={newCustomer.phone}
              onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 text-sm focus:outline-none dark:text-white"
            />
            <button onClick={handleAdd} className="w-full py-2.5 rounded-xl text-sm font-medium bg-[var(--color-primary)] text-white">
              Save & Select
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}