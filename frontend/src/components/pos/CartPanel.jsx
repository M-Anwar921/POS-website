import { useDispatch, useSelector } from "react-redux";
import { FiMinus, FiPlus, FiTrash2, FiUser, FiX } from "react-icons/fi";
import {
  incrementItem, decrementItem, removeItem, setCustomer, setDiscount, setTax, clearCart,
} from "../../store/slices/cartSlice";
import { useState } from "react";
import CustomerSearch from "./CustomerSearch";

export default function CartPanel({ onHold, onPay, cartTotals }) {
  const dispatch = useDispatch();
  const { items, customer, discountType, discountValue, taxPercent } = useSelector((s) => s.cart);
  const [showCustomerSearch, setShowCustomerSearch] = useState(false);

  const { subtotal, discountAmount, taxAmount, grandTotal } = cartTotals;

  return (
    <div className="w-full lg:w-96 flex flex-col bg-white dark:bg-[var(--color-card-dark)] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 h-full">
      <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
        <h2 className="font-semibold dark:text-white">Current Sale</h2>
        <button
          onClick={() => setShowCustomerSearch(true)}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-gray-50 dark:bg-gray-800 text-[var(--color-muted)]"
        >
          <FiUser size={13} />
          {customer ? customer.name : "Walk-in"}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {items.length === 0 ? (
          <p className="text-center text-sm text-[var(--color-muted)] py-10">Cart is empty — tap a product to add it</p>
        ) : (
          items.map((item) => (
            <div key={item.product} className="flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium dark:text-white truncate">{item.name}</p>
                <p className="text-xs text-[var(--color-muted)]">Rs {item.price.toFixed(0)} each</p>
              </div>
              <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-800 rounded-full px-1">
                <button onClick={() => dispatch(decrementItem(item.product))} className="p-1.5">
                  <FiMinus size={12} />
                </button>
                <span className="text-sm w-5 text-center dark:text-white">{item.quantity}</span>
                <button onClick={() => dispatch(incrementItem(item.product))} className="p-1.5" disabled={item.quantity >= item.stock}>
                  <FiPlus size={12} />
                </button>
              </div>
              <span className="text-sm font-semibold w-16 text-right dark:text-white">
                Rs {(item.price * item.quantity).toFixed(0)}
              </span>
              <button onClick={() => dispatch(removeItem(item.product))} className="text-[var(--color-danger)]">
                <FiTrash2 size={14} />
              </button>
            </div>
          ))
        )}
      </div>

      <div className="p-4 border-t border-gray-100 dark:border-gray-800 space-y-2">
        <div className="flex items-center gap-2 text-xs">
          <input
            type="number"
            min="0"
            placeholder="Discount"
            value={discountValue || ""}
            onChange={(e) => dispatch(setDiscount({ type: discountType, value: Number(e.target.value) }))}
            className="flex-1 px-2 py-1.5 rounded-lg bg-gray-50 dark:bg-gray-800 dark:text-white focus:outline-none"
          />
          <select
            value={discountType}
            onChange={(e) => dispatch(setDiscount({ type: e.target.value, value: discountValue }))}
            className="px-2 py-1.5 rounded-lg bg-gray-50 dark:bg-gray-800 dark:text-white focus:outline-none"
          >
            <option value="flat">Rs</option>
            <option value="percent">%</option>
          </select>
          <input
            type="number"
            min="0"
            placeholder="Tax %"
            value={taxPercent || ""}
            onChange={(e) => dispatch(setTax(Number(e.target.value)))}
            className="w-20 px-2 py-1.5 rounded-lg bg-gray-50 dark:bg-gray-800 dark:text-white focus:outline-none"
          />
        </div>

        <div className="space-y-1 text-sm pt-2">
          <div className="flex justify-between text-[var(--color-muted)]">
            <span>Subtotal</span><span>Rs {subtotal.toFixed(0)}</span>
          </div>
          {discountAmount > 0 && (
            <div className="flex justify-between text-[var(--color-danger)]">
              <span>Discount</span><span>-Rs {discountAmount.toFixed(0)}</span>
            </div>
          )}
          {taxAmount > 0 && (
            <div className="flex justify-between text-[var(--color-muted)]">
              <span>Tax</span><span>Rs {taxAmount.toFixed(0)}</span>
            </div>
          )}
          <div className="flex justify-between text-lg font-bold pt-1 dark:text-white">
            <span>Total</span><span>Rs {grandTotal.toFixed(0)}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-3">
          <button
            onClick={() => dispatch(clearCart())}
            disabled={items.length === 0}
            className="py-2.5 rounded-xl text-sm font-medium bg-gray-50 dark:bg-gray-800 text-[var(--color-danger)] disabled:opacity-40"
          >
            Clear Cart
          </button>
          <button
            onClick={onHold}
            disabled={items.length === 0}
            className="py-2.5 rounded-xl text-sm font-medium bg-gray-50 dark:bg-gray-800 text-[var(--color-warning)] disabled:opacity-40"
          >
            Hold Sale
          </button>
        </div>
        <button
          onClick={onPay}
          disabled={items.length === 0}
          className="w-full py-3.5 rounded-xl text-sm font-semibold bg-[var(--color-primary)] text-white disabled:opacity-40"
        >
          Charge Rs {grandTotal.toFixed(0)}
        </button>
      </div>

      {showCustomerSearch && (
        <CustomerSearch
          onClose={() => setShowCustomerSearch(false)}
          onSelect={(c) => { dispatch(setCustomer(c)); setShowCustomerSearch(false); }}
        />
      )}
    </div>
  );
}