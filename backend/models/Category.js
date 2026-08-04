import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    icon: { type: String, default: "FiTag" },
    color: { type: String, default: "#2563EB" },
    parent: { type: mongoose.Schema.Types.ObjectId, ref: "Category", default: null },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("Category", categorySchema);