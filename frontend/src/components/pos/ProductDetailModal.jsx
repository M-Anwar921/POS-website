import { motion } from "framer-motion";
import { FiX, FiPackage, FiShoppingCart } from "react-icons/fi";
import { useState } from "react";

export default function ProductDetailModal({ product, onClose, onAdd }) {
  const [qty, setQty] = useState(1);
  const isLow = product.stock > 0 && product.stock <= (product.lowStockThreshold || 5);
  const isOut = product.stock === 0;

  const handleAdd = () => {
    for (let i = 0; i < qty; i++) onAdd(product);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white dark:bg-[var(--color-card-dark)] rounded-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <h3 className="font-semibold dark:text-white">Product Details</h3>
          <button onClick={onClose}>
            <FiX className="dark:text-white" />
          </button>
        </div>

        <div className="p-5">
          <div className="w-full aspect-video rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center mb-4 overflow-hidden">
            {product.image ? (
              <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <FiPackage className="text-gray-300 dark:text-gray-600" size={48} />
            )}
          </div>

          <div className="flex items-start justify-between mb-1">
            <h2 className="text-lg font-semibold dark:text-white">{product.name}</h2>
            <span
              className={`text-[10px] px-2 py-1 rounded-full font-medium shrink-0 ml-2 ${
                isOut
                  ? "bg-red-100 text-[var(--color-danger)]"
                  : isLow
                  ? "bg-amber-100 text-[var(--color-warning)]"
                  : "bg-emerald-100 text-[var(--color-success)]"
              }`}
            >
              {isOut ? "Out of stock" : `${product.stock} in stock`}
            </span>
          </div>

          {product.category?.name && (
            <p className="text-xs text-[var(--color-muted)] mb-3">{product.category.name}</p>
          )}

          {product.description && (
            <p className="text-sm text-[var(--color-muted)] mb-4">{product.description}</p>
          )}

          <div className="grid grid-cols-2 gap-3 text-xs mb-4">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
              <p className="text-[var(--color-muted)] mb-0.5">SKU</p>
              <p className="font-medium dark:text-white">{product.sku}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
              <p className="text-[var(--color-muted)] mb-0.5">Barcode</p>
              <p className="font-medium dark:text-white">{product.barcode || "—"}</p>
            </div>
          </div>

          <p className="text-2xl font-bold text-[var(--color-primary)] mb-4">
            Rs {product.price.toFixed(0)}
          </p>

          {!isOut && (
            <div className="flex items-center gap-3 mb-4">
              <span className="text-sm text-[var(--color-muted)]">Quantity</span>
              <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 rounded-full px-2 py-1">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="w-7 h-7 flex items-center justify-center text-lg dark:text-white"
                >
                  −
                </button>
                <span className="w-6 text-center text-sm dark:text-white">{qty}</span>
                <button
                  onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                  className="w-7 h-7 flex items-center justify-center text-lg dark:text-white"
                >
                  +
                </button>
              </div>
            </div>
          )}

          <button
            onClick={handleAdd}
            disabled={isOut}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold ${
              isOut
                ? "bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed"
                : "bg-[var(--color-primary)] text-white"
            }`}
          >
            <FiShoppingCart size={16} />
            {isOut ? "Out of Stock" : `Add ${qty} to Cart`}
          </button>
        </div>
      </motion.div>
    </div>
  );
}