import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema(
  {
    storeName: { type: String, default: "My Store" },
    storeAddress: { type: String, default: "" },
    storePhone: { type: String, default: "" },
    storeEmail: { type: String, default: "" },
    logo: { type: String, default: "" },
    currency: { type: String, default: "PKR" },
    currencySymbol: { type: String, default: "Rs" },
    taxRate: { type: Number, default: 0 },
    receiptFooter: { type: String, default: "Thank you for shopping with us!" },
    returnPolicyText: { type: String, default: "Returns accepted within 7 days with receipt." },
    printerName: { type: String, default: "" },
    smtpHost: { type: String, default: "" },
    smtpPort: { type: String, default: "" },
    smtpUser: { type: String, default: "" },
    smsProvider: { type: String, default: "" },
    smsApiKey: { type: String, default: "" },
    autoBackupEnabled: { type: Boolean, default: false },
    backupFrequency: { type: String, enum: ["daily", "weekly", "monthly"], default: "weekly" },
    sessionTimeoutMinutes: { type: Number, default: 60 },
    language: { type: String, default: "en" },
    apiKey: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("Settings", settingsSchema);