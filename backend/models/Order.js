import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    lineTotal: { type: Number, required: true },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true },
    items: { type: [orderItemSchema], required: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", default: null },
    cashier: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    subtotal: { type: Number, required: true },
    discountType: { type: String, enum: ["flat", "percent"], default: "flat" },
    discountValue: { type: Number, default: 0 },
    discountAmount: { type: Number, default: 0 },
    taxPercent: { type: Number, default: 0 },
    taxAmount: { type: Number, default: 0 },
    grandTotal: { type: Number, required: true },
    paymentMethod: { type: String, enum: ["cash", "card", "qr", "split"], default: "cash" },
    paymentDetails: {
      cash: { type: Number, default: 0 },
      card: { type: Number, default: 0 },
      qr: { type: Number, default: 0 },
    },
    amountTendered: { type: Number, default: 0 },
    changeDue: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["held", "pending", "completed", "cancelled", "refunded", "partially_refunded"],
      default: "completed",
    },
    statusHistory: [
      {
        status: String,
        note: String,
        changedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);