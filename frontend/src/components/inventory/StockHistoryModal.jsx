import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FiX } from "react-icons/fi";
import api from "../../api/axios";

const typeLabels = {
  in: { label: "Stock In", color: "text-[var(--color-success)]" },
  out: { label: "Stock Out", color: "text-[var(--color-danger)]" },
  adjustment: { label: "Correction", color: "text-[var(--color-warning)]" },
  transfer_in: { label: "Transfer In", color: "text-[var(--color-primary)]" },
  transfer_out: { label: "Transfer Out", color: "text-[var(--color-primary)]" },
  sale: { label: "Sale", color: "text-[var(--color-muted)]" },
};

export default function StockHistoryModal({ product, onClose }) {
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/inventory/history/${product._id}`).then((res) => setMovements(res.data.data)).finally(() => setLoading(false));
  }, [product]);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md bg-white dark:bg-[var(--color-card-dark)] rounded-2xl overflow-hidden max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <h3 className="font-semibold dark:text-white">History — {product.name}</h3>
          <button onClick={onClose}><FiX className="dark:text-white" /></button>
        </div>

        <div className="p-5 overflow-y-auto space-y-3">
          {loading ? (
            <p className="text-sm text-[var(--color-muted)]">Loading...</p>
          ) : movements.length === 0 ? (
            <p className="text-sm text-[var(--color-muted)] text-center py-6">No movement history yet</p>
          ) : (
            movements.map((m) => (
              <div key={m._id} className="flex items-center justify-between text-sm border-b border-gray-50 dark:border-gray-800/50 pb-2">
                <div>
                  <p className={`font-medium ${typeLabels[m.type]?.color}`}>{typeLabels[m.type]?.label}</p>
                  <p className="text-xs text-[var(--color-muted)]">
                    {m.warehouse?.name} · {new Date(m.createdAt).toLocaleString()} · {m.performedBy?.name}
                  </p>
                  {m.reason && <p className="text-xs text-[var(--color-muted)] italic">{m.reason}</p>}
                </div>
                <span className="font-semibold dark:text-white">
                  {["out", "transfer_out", "sale"].includes(m.type) ? "-" : "+"}{m.quantity}
                </span>
              </div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
}