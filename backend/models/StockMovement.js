import mongoose from "mongoose";

const stockMovementSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    warehouse: { type: mongoose.Schema.Types.ObjectId, ref: "Warehouse", required: true },
    type: {
      type: String,
      enum: ["in", "out", "adjustment", "transfer_in", "transfer_out", "sale"],
      required: true,
    },
    quantity: { type: Number, required: true },
    batchNumber: { type: String, default: "" },
    expiryDate: { type: Date, default: null },
    relatedWarehouse: { type: mongoose.Schema.Types.ObjectId, ref: "Warehouse", default: null },
    reason: { type: String, default: "" },
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export default mongoose.model("StockMovement", stockMovementSchema);