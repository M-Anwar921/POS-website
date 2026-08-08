import mongoose from "mongoose";

const supplierPaymentSchema = new mongoose.Schema(
  {
    supplier: { type: mongoose.Schema.Types.ObjectId, ref: "Supplier", required: true },
    invoice: { type: mongoose.Schema.Types.ObjectId, ref: "SupplierInvoice", required: true },
    amount: { type: Number, required: true, min: 0 },
    method: { type: String, enum: ["cash", "bank_transfer", "cheque", "card"], default: "cash" },
    date: { type: Date, default: Date.now },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("SupplierPayment", supplierPaymentSchema);