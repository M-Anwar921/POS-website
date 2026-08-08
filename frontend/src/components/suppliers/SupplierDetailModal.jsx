import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FiX, FiPlus, FiDollarSign } from "react-icons/fi";
import api from "../../api/axios";
import toast from "react-hot-toast";

export default function SupplierDetailModal({ supplierId, onClose, onChanged }) {
  const [supplier, setSupplier] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [invoiceForm, setInvoiceForm] = useState({ invoiceNumber: "", amount: "", dueDate: "", notes: "" });
  const [payingInvoice, setPayingInvoice] = useState(null);
  const [paymentForm, setPaymentForm] = useState({ amount: "", method: "cash", notes: "" });

  const fetchSupplier = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/suppliers/${supplierId}`);
      setSupplier(res.data.data);
    } catch {
      toast.error("Failed to load supplier");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSupplier(); }, [supplierId]);

  const handleAddInvoice = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/suppliers/${supplierId}/invoices`, invoiceForm);
      toast.success("Invoice added");
      setShowInvoiceForm(false);
      setInvoiceForm({ invoiceNumber: "", amount: "", dueDate: "", notes: "" });
      fetchSupplier();
      onChanged();
    } catch {
      toast.error("Failed to add invoice");
    }
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/suppliers/${supplierId}/payments`, { ...paymentForm, invoice: payingInvoice._id });
      toast.success("Payment recorded");
      setPayingInvoice(null);
      setPaymentForm({ amount: "", method: "cash", notes: "" });
      fetchSupplier();
      onChanged();
    } catch (error) {
      toast.error(error.response?.data?.message || "Payment failed");
    }
  };

  if (loading || !supplier) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-[var(--color-card-dark)] rounded-2xl p-8 text-sm text-[var(--color-muted)]">Loading...</div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-lg bg-white dark:bg-[var(--color-card-dark)] rounded-2xl overflow-hidden max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <div>
            <h3 className="font-semibold dark:text-white">{supplier.name}</h3>
            <p className="text-xs text-[var(--color-muted)]">{supplier.contactPerson} · {supplier.phone}</p>
          </div>
          <button onClick={onClose}><FiX className="dark:text-white" /></button>
        </div>

        <div className="p-5 overflow-y-auto space-y-5">
          <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
            <span className="text-sm text-[var(--color-muted)]">Outstanding Balance</span>
            <span className={`text-lg font-bold ${supplier.outstandingBalance > 0 ? "text-[var(--color-danger)]" : "text-[var(--color-success)]"}`}>
              Rs {supplier.outstandingBalance.toFixed(0)}
            </span>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold dark:text-white">Invoices</h4>
              <button onClick={() => setShowInvoiceForm(!showInvoiceForm)} className="flex items-center gap-1 text-xs text-[var(--color-primary)] font-medium">
                <FiPlus size={12} /> New Invoice
              </button>
            </div>

            {showInvoiceForm && (
              <form onSubmit={handleAddInvoice} className="space-y-2 mb-3 bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
                <input required placeholder="Invoice number" value={invoiceForm.invoiceNumber} onChange={(e) => setInvoiceForm({ ...invoiceForm, invoiceNumber: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-white dark:bg-gray-900 text-sm focus:outline-none dark:text-white" />
                <div className="grid grid-cols-2 gap-2">
                  <input required type="number" placeholder="Amount" value={invoiceForm.amount} onChange={(e) => setInvoiceForm({ ...invoiceForm, amount: e.target.value })} className="px-3 py-2 rounded-lg bg-white dark:bg-gray-900 text-sm focus:outline-none dark:text-white" />
                  <input type="date" value={invoiceForm.dueDate} onChange={(e) => setInvoiceForm({ ...invoiceForm, dueDate: e.target.value })} className="px-3 py-2 rounded-lg bg-white dark:bg-gray-900 text-sm focus:outline-none dark:text-white" />
                </div>
                <button type="submit" className="w-full py-2 rounded-lg text-xs font-semibold bg-[var(--color-primary)] text-white">Save Invoice</button>
              </form>
            )}

            <div className="space-y-2">
              {supplier.invoices.length === 0 ? (
                <p className="text-xs text-[var(--color-muted)]">No invoices yet</p>
              ) : (
                supplier.invoices.map((inv) => (
                  <div key={inv._id} className="flex items-center justify-between text-sm border-b border-gray-50 dark:border-gray-800/50 pb-2">
                    <div>
                      <p className="font-medium dark:text-white">{inv.invoiceNumber}</p>
                      <p className="text-xs text-[var(--color-muted)]">
                        Rs {inv.amount.toFixed(0)} · Paid Rs {inv.amountPaid.toFixed(0)} ·{" "}
                        <span className={inv.status === "paid" ? "text-[var(--color-success)]" : inv.status === "partial" ? "text-[var(--color-warning)]" : "text-[var(--color-danger)]"}>
                          {inv.status}
                        </span>
                      </p>
                    </div>
                    {inv.status !== "paid" && (
                      <button onClick={() => setPayingInvoice(inv)} className="flex items-center gap-1 text-xs text-[var(--color-primary)] font-medium">
                        <FiDollarSign size={12} /> Pay
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {payingInvoice && (
            <form onSubmit={handleRecordPayment} className="space-y-2 bg-blue-50 dark:bg-blue-950/20 rounded-xl p-3">
              <p className="text-xs font-medium dark:text-white">Record payment for {payingInvoice.invoiceNumber}</p>
              <div className="grid grid-cols-2 gap-2">
                <input required type="number" max={payingInvoice.amount - payingInvoice.amountPaid} placeholder="Amount" value={paymentForm.amount} onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })} className="px-3 py-2 rounded-lg bg-white dark:bg-gray-900 text-sm focus:outline-none dark:text-white" />
                <select value={paymentForm.method} onChange={(e) => setPaymentForm({ ...paymentForm, method: e.target.value })} className="px-3 py-2 rounded-lg bg-white dark:bg-gray-900 text-sm focus:outline-none dark:text-white">
                  <option value="cash">Cash</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="cheque">Cheque</option>
                  <option value="card">Card</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button type="submit" className="flex-1 py-2 rounded-lg text-xs font-semibold bg-[var(--color-success)] text-white">Confirm Payment</button>
                <button type="button" onClick={() => setPayingInvoice(null)} className="px-3 py-2 rounded-lg text-xs bg-gray-100 dark:bg-gray-800 dark:text-white">Cancel</button>
              </div>
            </form>
          )}

          <div>
            <h4 className="text-sm font-semibold dark:text-white mb-2">Payment History</h4>
            {supplier.payments.length === 0 ? (
              <p className="text-xs text-[var(--color-muted)]">No payments recorded yet</p>
            ) : (
              <div className="space-y-1.5">
                {supplier.payments.map((p) => (
                  <div key={p._id} className="flex justify-between text-xs text-[var(--color-muted)]">
                    <span>{p.invoice?.invoiceNumber} · {p.method} · {new Date(p.date).toLocaleDateString()}</span>
                    <span className="font-medium text-[var(--color-success)]">Rs {p.amount.toFixed(0)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}