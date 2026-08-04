import mongoose from "mongoose";

const customerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    address: { type: String, default: "" },
    loyaltyPoints: { type: Number, default: 0 },
    creditBalance: { type: Number, default: 0 },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("Customer", customerSchema);