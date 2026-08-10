import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      enum: ["Utilities", "Rent", "Salary", "Transportation", "Marketing", "Maintenance", "Other"],
      required: true,
    },
    customCategory: { type: String, default: "" }, // used when category === "Other"
    amount: { type: Number, required: true, min: 0 },
    description: { type: String, default: "" },
    date: { type: Date, default: Date.now },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Expense", expenseSchema);