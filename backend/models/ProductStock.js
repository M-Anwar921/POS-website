import mongoose from "mongoose";

const productStockSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    warehouse: { type: mongoose.Schema.Types.ObjectId, ref: "Warehouse", required: true },
    quantity: { type: Number, required: true, default: 0, min: 0 },
    batchNumber: { type: String, default: "" },
    expiryDate: { type: Date, default: null },
  },
  { timestamps: true }
);

productStockSchema.index({ product: 1, warehouse: 1, batchNumber: 1 }, { unique: true });

export default mongoose.model("ProductStock", productStockSchema);