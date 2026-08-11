import ActivityLog from "../models/ActivityLog.js";

export const logActivity = async (userId, action, module, details = "") => {
  try {
    await ActivityLog.create({ user: userId, action, module, details });
  } catch (err) {
    console.error("Failed to log activity:", err.message);
  }
};