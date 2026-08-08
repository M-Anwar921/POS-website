import mongoose from "mongoose";

const supplierInvoiceSchema = new mongoose.Schema(
  {
    supplier: { type: mongoose.Schema.Types.ObjectId, ref: "Supplier", required: true },
    invoiceNumber: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 },
    amountPaid: { type: Number, default: 0, min: 0 },
    dueDate: { type: Date },
    notes: { type: String, default: "" },
    status: { type: String, enum: ["unpaid", "partial", "paid"], default: "unpaid" },
  },
  { timestamps: true }
);

supplierInvoiceSchema.pre("save", function (next) {
  if (this.amountPaid >= this.amount) this.status = "paid";
  else if (this.amountPaid > 0) this.status = "partial";
  else this.status = "unpaid";
  next();
});

export default mongoose.model("SupplierInvoice", supplierInvoiceSchema);