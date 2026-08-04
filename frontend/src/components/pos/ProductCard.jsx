import { motion } from "framer-motion";
import { FiPlus, FiPackage } from "react-icons/fi";

export default function ProductCard({ product, onAdd }) {
  const isLow = product.stock > 0 && product.stock <= (product.lowStockThreshold || 5);
  const isOut = product.stock === 0;

  return (
    <motion.button
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.97 }}
      disabled={isOut}
      onClick={() => onAdd(product)}
      className={`text-left bg-white dark:bg-[var(--color-card-dark)] rounded-2xl p-3 shadow-sm border border-gray-100 dark:border-gray-800 transition-shadow hover:shadow-md ${
        isOut ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
      }`}
    >
      <div className="w-full aspect-square rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center mb-2 overflow-hidden">
        {product.image ? (
          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <FiPackage className="text-gray-300 dark:text-gray-600" size={32} />
        )}
      </div>
      <p className="text-sm font-medium text-[var(--color-text-light)] dark:text-white truncate">{product.name}</p>
      <div className="flex items-center justify-between mt-1">
        <span className="text-sm font-semibold text-[var(--color-primary)]">Rs {product.price.toFixed(0)}</span>
        <span
          className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
            isOut
              ? "bg-red-100 text-[var(--color-danger)]"
              : isLow
              ? "bg-amber-100 text-[var(--color-warning)]"
              : "bg-emerald-100 text-[var(--color-success)]"
          }`}
        >
          {isOut ? "Out" : `${product.stock} left`}
        </span>
      </div>
      {!isOut && (
        <div className="absolute top-2 right-2 bg-[var(--color-primary)] text-white rounded-full p-1 opacity-0 group-hover:opacity-100">
          <FiPlus size={12} />
        </div>
      )}
    </motion.button>
  );
}