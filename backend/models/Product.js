import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    sku: { type: String, required: true, unique: true, trim: true },
    barcode: { type: String, unique: true, sparse: true, trim: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    price: { type: Number, required: true, min: 0 },
    cost: { type: Number, default: 0, min: 0 },
    stock: { type: Number, required: true, default: 0, min: 0 },
    lowStockThreshold: { type: Number, default: 5 },
    image: { type: String, default: "" },
    description: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
    isArchived: { type: Boolean, default: false },
  },
  { timestamps: true }
);

productSchema.index({ name: "text", sku: "text", barcode: "text" });

export default mongoose.model("Product", productSchema);