import { useMemo, useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import api from "../api/axios";
import { addItem, clearCart, loadCartItems, setCustomer, setDiscount, setTax } from "../store/slices/cartSlice";
import ProductGrid from "../components/pos/ProductGrid";
import CartPanel from "../components/pos/CartPanel";
import PaymentModal from "../components/pos/PaymentModal";
import ReceiptModal from "../components/pos/ReceiptModal";

export default function POS() {
  const dispatch = useDispatch();
  const cart = useSelector((s) => s.cart);
  const { user } = useSelector((s) => s.auth);
  const [showPayment, setShowPayment] = useState(false);
  const [completedOrder, setCompletedOrder] = useState(null);

  const totals = useMemo(() => {
    const subtotal = cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const discountAmount = cart.discountType === "percent" ? (subtotal * cart.discountValue) / 100 : cart.discountValue;
    const taxable = Math.max(subtotal - discountAmount, 0);
    const taxAmount = (taxable * cart.taxPercent) / 100;
    const grandTotal = taxable + taxAmount;
    return { subtotal, discountAmount, taxAmount, grandTotal };
  }, [cart]);

  const handleAddToCart = (product) => {
    if (product.stock === 0) return toast.error("Out of stock");
    dispatch(addItem(product));
  };

  const handleHold = async () => {
    try {
      await api.post("/orders/hold", {
        items: cart.items.map((i) => ({ product: i.product, name: i.name, price: i.price, quantity: i.quantity, lineTotal: i.price * i.quantity })),
        customer: cart.customer?._id,
        discountType: cart.discountType,
        discountValue: cart.discountValue,
        taxPercent: cart.taxPercent,
      });
      dispatch(clearCart());
      toast.success("Sale held");
    } catch {
      toast.error("Failed to hold sale");
    }
  };

  const handlePaymentConfirm = async ({ paymentMethod, paymentDetails, amountTendered }) => {
    try {
      const res = await api.post("/orders", {
        items: cart.items.map((i) => ({ product: i.product, quantity: i.quantity })),
        customer: cart.customer?._id,
        discountType: cart.discountType,
        discountValue: cart.discountValue,
        taxPercent: cart.taxPercent,
        paymentMethod, paymentDetails, amountTendered,
      });
      setShowPayment(false);
      setCompletedOrder({ ...res.data.data, cashierName: user.name });
      dispatch(clearCart());
      toast.success("Sale completed");
    } catch (error) {
      toast.error(error.response?.data?.message || "Payment failed");
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "F2") { e.preventDefault(); document.getElementById("pos-search")?.focus(); }
      if (e.key === "F4") { e.preventDefault(); if (cart.items.length) handleHold(); }
      if (e.key === "F5") { e.preventDefault(); if (cart.items.length) setShowPayment(true); }
      if (e.key === "Escape") { setShowPayment(false); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [cart]);

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-8rem)]">
      <ProductGrid onAddToCart={handleAddToCart} />
      <CartPanel
        cartTotals={totals}
        onHold={handleHold}
        onPay={() => setShowPayment(true)}
      />

      {showPayment && (
        <PaymentModal
          grandTotal={totals.grandTotal}
          onClose={() => setShowPayment(false)}
          onConfirm={handlePaymentConfirm}
        />
      )}

      {completedOrder && (
        <ReceiptModal
          order={completedOrder}
          onClose={() => setCompletedOrder(null)}
          onNewSale={() => setCompletedOrder(null)}
        />
      )}
    </div>
  );
}