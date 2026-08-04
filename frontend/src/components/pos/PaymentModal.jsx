import { useState } from "react";
import { motion } from "framer-motion";
import { FiX, FiDollarSign, FiCreditCard, FiSmartphone, FiDivide } from "react-icons/fi";

const methods = [
  { id: "cash", label: "Cash", icon: FiDollarSign },
  { id: "card", label: "Card", icon: FiCreditCard },
  { id: "qr", label: "QR", icon: FiSmartphone },
  { id: "split", label: "Split", icon: FiDivide },
];

export default function PaymentModal({ grandTotal, onClose, onConfirm }) {
  const [method, setMethod] = useState("cash");
  const [tendered, setTendered] = useState("");
  const [splitCash, setSplitCash] = useState("");
  const [splitCard, setSplitCard] = useState("");

  const change = method === "cash" && tendered ? Math.max(Number(tendered) - grandTotal, 0) : 0;
  const splitTotal = Number(splitCash || 0) + Number(splitCard || 0);

  const handleConfirm = () => {
    const paymentDetails = { cash: 0, card: 0, qr: 0 };
    let amountTendered = grandTotal;

    if (method === "cash") {
      paymentDetails.cash = grandTotal;
      amountTendered = Number(tendered) || grandTotal;
    } else if (method === "card") {
      paymentDetails.card = grandTotal;
    } else if (method === "qr") {
      paymentDetails.qr = grandTotal;
    } else if (method === "split") {
      paymentDetails.cash = Number(splitCash || 0);
      paymentDetails.card = Number(splitCard || 0);
    }

    onConfirm({ paymentMethod: method, paymentDetails, amountTendered });
  };

  const isValid = method !== "split" || Math.abs(splitTotal - grandTotal) < 0.01;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm bg-white dark:bg-[var(--color-card-dark)] rounded-2xl p-5"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold dark:text-white">Payment</h3>
          <button onClick={onClose}><FiX className="dark:text-white" /></button>
        </div>

        <p className="text-center text-3xl font-bold text-[var(--color-primary)] mb-5">Rs {grandTotal.toFixed(0)}</p>

        <div className="grid grid-cols-4 gap-2 mb-5">
          {methods.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setMethod(id)}
              className={`flex flex-col items-center gap-1.5 py-3 rounded-xl text-xs font-medium ${
                method === id ? "bg-[var(--color-primary)] text-white" : "bg-gray-50 dark:bg-gray-800 text-[var(--color-muted)]"
              }`}
            >
              <Icon size={18} />
              {label}
            </button>
          ))}
        </div>

        {method === "cash" && (
          <div className="space-y-2 mb-4">
            <input
              type="number"
              placeholder="Amount tendered"
              value={tendered}
              onChange={(e) => setTendered(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 text-sm focus:outline-none dark:text-white"
            />
            {tendered && (
              <p className="text-sm text-[var(--color-muted)]">
                Change due: <span className="font-semibold text-[var(--color-success)]">Rs {change.toFixed(0)}</span>
              </p>
            )}
          </div>
        )}

        {method === "split" && (
          <div className="space-y-2 mb-4">
            <input
              type="number"
              placeholder="Cash amount"
              value={splitCash}
              onChange={(e) => setSplitCash(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 text-sm focus:outline-none dark:text-white"
            />
            <input
              type="number"
              placeholder="Card amount"
              value={splitCard}
              onChange={(e) => setSplitCard(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 text-sm focus:outline-none dark:text-white"
            />
            {splitTotal > 0 && !isValid && (
              <p className="text-xs text-[var(--color-danger)]">
                Split total (Rs {splitTotal.toFixed(0)}) must equal Rs {grandTotal.toFixed(0)}
              </p>
            )}
          </div>
        )}

        <button
          onClick={handleConfirm}
          disabled={!isValid}
          className="w-full py-3.5 rounded-xl text-sm font-semibold bg-[var(--color-success)] text-white disabled:opacity-40"
        >
          Complete Sale
        </button>
      </motion.div>
    </div>
  );
}