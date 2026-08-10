import { useEffect, useState, useCallback } from "react";
import { FiPlus, FiSearch, FiUser, FiStar, FiDollarSign } from "react-icons/fi";
import api from "../api/axios";
import toast from "react-hot-toast";
import CustomerFormModal from "../components/customers/CustomerFormModal";
import CustomerDetailModal from "../components/customers/CustomerDetailModal";

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [detailId, setDetailId] = useState(null);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/customers", { params: { search } });
      setCustomers(res.data.data);
    } catch {
      toast.error("Failed to load customers");
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const t = setTimeout(fetchCustomers, 300);
    return () => clearTimeout(t);
  }, [fetchCustomers]);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <h1 className="text-xl font-semibold dark:text-white">Customers</h1>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-[var(--color-primary)] text-white">
          <FiPlus size={14} /> Add Customer
        </button>
      </div>

      <div className="relative mb-4 max-w-sm">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or phone..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-[var(--color-card-dark)] border border-gray-200 dark:border-gray-700 text-sm focus:outline-none dark:text-white"
        />
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-28 rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse" />)}
        </div>
      ) : customers.length === 0 ? (
        <p className="text-center text-[var(--color-muted)] py-10 text-sm">No customers yet</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {customers.map((c) => (
            <button
              key={c._id}
              onClick={() => setDetailId(c._id)}
              className="text-left bg-white dark:bg-[var(--color-card-dark)] rounded-2xl p-4 border border-gray-100 dark:border-gray-800 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center">
                  <FiUser className="text-[var(--color-primary)]" size={18} />
                </div>
                <div>
                  <p className="font-medium dark:text-white">{c.name}</p>
                  <p className="text-xs text-[var(--color-muted)]">{c.phone || "No phone"}</p>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1 text-[var(--color-warning)]">
                  <FiStar size={11} /> {c.loyaltyPoints} pts
                </span>
                {c.creditBalance > 0 && (
                  <span className="flex items-center gap-1 text-[var(--color-danger)] font-medium">
                    <FiDollarSign size={11} /> Rs {c.creditBalance.toFixed(0)} due
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {showForm && <CustomerFormModal onClose={() => setShowForm(false)} onSaved={() => { setShowForm(false); fetchCustomers(); }} />}
      {detailId && (
        <CustomerDetailModal customerId={detailId} onClose={() => setDetailId(null)} onChanged={fetchCustomers} />
      )}
    </div>
  );
}