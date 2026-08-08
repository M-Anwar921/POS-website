import { useEffect, useState, useCallback } from "react";
import { FiPackage, FiAlertTriangle, FiClock, FiArrowRightCircle, FiSliders } from "react-icons/fi";
import api from "../api/axios";
import toast from "react-hot-toast";
import StockAdjustModal from "../components/inventory/StockAdjustModal";
import StockTransferModal from "../components/inventory/StockTransferModal";
import StockHistoryModal from "../components/inventory/StockHistoryModal";

const tabs = [
  { id: "all", label: "All Stock" },
  { id: "low", label: "Low Stock" },
  { id: "out", label: "Out of Stock" },
  { id: "expiring", label: "Expiring Soon" },
];

export default function Inventory() {
  const [tab, setTab] = useState("all");
  const [warehouses, setWarehouses] = useState([]);
  const [warehouseFilter, setWarehouseFilter] = useState("");
  const [stocks, setStocks] = useState([]);
  const [expiring, setExpiring] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdjust, setShowAdjust] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);
  const [historyProduct, setHistoryProduct] = useState(null);

  useEffect(() => {
    api.get("/warehouses").then((res) => setWarehouses(res.data.data));
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      if (tab === "expiring") {
        const res = await api.get("/inventory/expiring", { params: { days: 30 } });
        setExpiring(res.data.data);
      } else {
        const res = await api.get("/inventory/overview", {
          params: {
            warehouse: warehouseFilter,
            lowStockOnly: tab === "low",
            outOfStockOnly: tab === "out",
          },
        });
        setStocks(res.data.data);
      }
    } catch {
      toast.error("Failed to load inventory data");
    } finally {
      setLoading(false);
    }
  }, [tab, warehouseFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <h1 className="text-xl font-semibold dark:text-white">Inventory</h1>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setShowTransfer(true)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium bg-white dark:bg-[var(--color-card-dark)] border border-gray-200 dark:border-gray-700 dark:text-white">
            <FiArrowRightCircle size={14} /> Transfer Stock
          </button>
          <button onClick={() => setShowAdjust(true)} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-[var(--color-primary)] text-white">
            <FiSliders size={14} /> Adjust Stock
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium ${
              tab === t.id ? "bg-[var(--color-primary)] text-white" : "bg-white dark:bg-[var(--color-card-dark)] text-[var(--color-muted)] border border-gray-200 dark:border-gray-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab !== "expiring" && (
        <select
          value={warehouseFilter}
          onChange={(e) => setWarehouseFilter(e.target.value)}
          className="mb-4 px-4 py-2.5 rounded-xl bg-white dark:bg-[var(--color-card-dark)] border border-gray-200 dark:border-gray-700 text-sm dark:text-white"
        >
          <option value="">All Warehouses</option>
          {warehouses.map((w) => <option key={w._id} value={w._id}>{w.name}</option>)}
        </select>
      )}

      <div className="bg-white dark:bg-[var(--color-card-dark)] rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800 text-left text-[var(--color-muted)]">
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 font-medium">Warehouse</th>
                <th className="px-4 py-3 font-medium">Quantity</th>
                {tab === "expiring" ? (
                  <th className="px-4 py-3 font-medium">Expires</th>
                ) : (
                  <th className="px-4 py-3 font-medium">Batch</th>
                )}
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}><td colSpan={5} className="px-4 py-4"><div className="h-4 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" /></td></tr>
                ))
              ) : tab === "expiring" ? (
                expiring.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-10 text-[var(--color-muted)]">Nothing expiring in the next 30 days</td></tr>
                ) : (
                  expiring.map((s) => (
                    <tr key={s._id} className="border-b border-gray-50 dark:border-gray-800/50">
                      <td className="px-4 py-3 font-medium dark:text-white">{s.product?.name}</td>
                      <td className="px-4 py-3 text-[var(--color-muted)]">{s.warehouse?.name}</td>
                      <td className="px-4 py-3 dark:text-white">{s.quantity}</td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-1 text-[var(--color-warning)] text-xs font-medium">
                          <FiClock size={12} /> {new Date(s.expiryDate).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-4 py-3"></td>
                    </tr>
                  ))
                )
              ) : stocks.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-10 text-[var(--color-muted)]">No stock records found</td></tr>
              ) : (
                stocks.map((s) => (
                  <tr key={s._id} className="border-b border-gray-50 dark:border-gray-800/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <FiPackage className="text-gray-300" size={14} />
                        <span className="font-medium dark:text-white">{s.product?.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[var(--color-muted)]">{s.warehouse?.name}</td>
                    <td className="px-4 py-3">
                      <span className={s.quantity === 0 ? "text-[var(--color-danger)] font-medium" : s.quantity <= (s.product?.lowStockThreshold || 5) ? "text-[var(--color-warning)] font-medium" : "dark:text-white"}>
                        {s.quantity === 0 && <FiAlertTriangle className="inline mr-1" size={12} />}
                        {s.quantity}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[var(--color-muted)]">{s.batchNumber || "—"}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => setHistoryProduct(s.product)} className="text-xs text-[var(--color-primary)] font-medium">
                        View History
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAdjust && <StockAdjustModal warehouses={warehouses} onClose={() => setShowAdjust(false)} onSaved={() => { setShowAdjust(false); fetchData(); }} />}
      {showTransfer && <StockTransferModal warehouses={warehouses} onClose={() => setShowTransfer(false)} onSaved={() => { setShowTransfer(false); fetchData(); }} />}
      {historyProduct && <StockHistoryModal product={historyProduct} onClose={() => setHistoryProduct(null)} />}
    </div>
  );
}