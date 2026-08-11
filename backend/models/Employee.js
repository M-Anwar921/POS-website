import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    employeeId: { type: String, required: true, unique: true },
    department: { type: String, default: "" },
    position: { type: String, default: "" },
    hireDate: { type: Date, default: Date.now },
    baseSalary: { type: Number, default: 0, min: 0 },
    status: { type: String, enum: ["active", "on_leave", "terminated"], default: "active" },
  },
  { timestamps: true }
);

export default mongoose.model("Employee", employeeSchema);