import { useEffect, useState, useCallback } from "react";
import { FiPlus, FiSearch, FiTruck } from "react-icons/fi";
import api from "../api/axios";
import toast from "react-hot-toast";
import SupplierFormModal from "../components/suppliers/SupplierFormModal";
import SupplierDetailModal from "../components/suppliers/SupplierDetailModal";

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [detailSupplier, setDetailSupplier] = useState(null);

  const fetchSuppliers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/suppliers", { params: { search } });
      setSuppliers(res.data.data);
    } catch {
      toast.error("Failed to load suppliers");
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const t = setTimeout(fetchSuppliers, 300);
    return () => clearTimeout(t);
  }, [fetchSuppliers]);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <h1 className="text-xl font-semibold dark:text-white">Suppliers</h1>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-[var(--color-primary)] text-white">
          <FiPlus size={14} /> Add Supplier
        </button>
      </div>

      <div className="relative mb-4 max-w-sm">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search suppliers..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-[var(--color-card-dark)] border border-gray-200 dark:border-gray-700 text-sm focus:outline-none dark:text-white"
        />
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-28 rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse" />)}
        </div>
      ) : suppliers.length === 0 ? (
        <p className="text-center text-[var(--color-muted)] py-10 text-sm">No suppliers yet</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {suppliers.map((s) => (
            <button
              key={s._id}
              onClick={() => setDetailSupplier(s)}
              className="text-left bg-white dark:bg-[var(--color-card-dark)] rounded-2xl p-4 border border-gray-100 dark:border-gray-800 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center">
                  <FiTruck className="text-[var(--color-primary)]" size={18} />
                </div>
                <div>
                  <p className="font-medium dark:text-white">{s.name}</p>
                  <p className="text-xs text-[var(--color-muted)]">{s.contactPerson || "No contact set"}</p>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[var(--color-muted)]">{s.phone || "—"}</span>
                <span className={`font-semibold ${s.outstandingBalance > 0 ? "text-[var(--color-danger)]" : "text-[var(--color-success)]"}`}>
                  {s.outstandingBalance > 0 ? `Rs ${s.outstandingBalance.toFixed(0)} due` : "Settled"}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      {showForm && <SupplierFormModal onClose={() => setShowForm(false)} onSaved={() => { setShowForm(false); fetchSuppliers(); }} />}
      {detailSupplier && (
        <SupplierDetailModal
          supplierId={detailSupplier._id}
          onClose={() => setDetailSupplier(null)}
          onChanged={fetchSuppliers}
        />
      )}
    </div>
  );
}