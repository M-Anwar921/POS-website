import { motion } from "framer-motion";
import { FiX, FiPrinter } from "react-icons/fi";
import Barcode from "react-barcode";

export default function ReceiptModal({ order, onClose, onNewSale }) {
  const handlePrint = () => window.print();

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm bg-white rounded-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b print:hidden">
          <h3 className="font-semibold text-gray-900">Receipt</h3>
          <button onClick={onClose}><FiX /></button>
        </div>

        <div id="receipt-print" className="p-6 font-mono text-xs text-gray-900">
          <div className="text-center mb-3">
            <p className="text-base font-bold">YOUR STORE NAME</p>
            <p>123 Main Street, Lahore</p>
            <p>Tel: 0300-1234567</p>
          </div>
          <div className="border-t border-dashed border-gray-400 my-2" />
          <div className="flex justify-between"><span>Order #</span><span>{order.orderNumber}</span></div>
          <div className="flex justify-between"><span>Date</span><span>{new Date(order.createdAt).toLocaleString()}</span></div>
          <div className="flex justify-between"><span>Cashier</span><span>{order.cashierName || "—"}</span></div>
          <div className="border-t border-dashed border-gray-400 my-2" />
          {order.items.map((item, idx) => (
            <div key={idx} className="mb-1">
              <div className="flex justify-between"><span>{item.name}</span><span>{item.lineTotal.toFixed(0)}</span></div>
              <div className="text-gray-500">{item.quantity} x {item.price.toFixed(0)}</div>
            </div>
          ))}
          <div className="border-t border-dashed border-gray-400 my-2" />
          <div className="flex justify-between"><span>Subtotal</span><span>Rs {order.subtotal.toFixed(0)}</span></div>
          {order.discountAmount > 0 && (
            <div className="flex justify-between"><span>Discount</span><span>-Rs {order.discountAmount.toFixed(0)}</span></div>
          )}
          {order.taxAmount > 0 && (
            <div className="flex justify-between"><span>Tax</span><span>Rs {order.taxAmount.toFixed(0)}</span></div>
          )}
          <div className="flex justify-between font-bold text-sm mt-1"><span>TOTAL</span><span>Rs {order.grandTotal.toFixed(0)}</span></div>
          <div className="border-t border-dashed border-gray-400 my-2" />
          <div className="flex justify-between"><span>Payment</span><span className="uppercase">{order.paymentMethod}</span></div>
          {order.changeDue > 0 && (
            <div className="flex justify-between"><span>Change</span><span>Rs {order.changeDue.toFixed(0)}</span></div>
          )}
          <div className="flex flex-col items-center mt-4">
            <Barcode value={order.orderNumber} height={40} width={1.3} fontSize={11} />
          </div>
          <p className="text-center mt-3">Thank you for shopping with us!</p>
          <p className="text-center text-gray-500">Returns accepted within 7 days with receipt.</p>
        </div>

        <div className="flex gap-2 p-4 border-t print:hidden">
          <button onClick={handlePrint} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium bg-gray-100 text-gray-700">
            <FiPrinter size={14} /> Print
          </button>
          <button onClick={onNewSale} className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-[var(--color-primary)] text-white">
            New Sale
          </button>
        </div>
      </motion.div>
    </div>
  );
}