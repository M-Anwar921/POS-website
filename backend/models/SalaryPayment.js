import mongoose from "mongoose";

const salaryPaymentSchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
    amount: { type: Number, required: true, min: 0 },
    month: { type: Number, required: true },
    year: { type: Number, required: true },
    paidDate: { type: Date, default: Date.now },
    notes: { type: String, default: "" },
    paidBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

salaryPaymentSchema.index({ employee: 1, month: 1, year: 1 }, { unique: true });

export default mongoose.model("SalaryPayment", salaryPaymentSchema);