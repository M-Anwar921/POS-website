import ActivityLog from "../models/ActivityLog.js";

export const getActivityLogs = async (req, res, next) => {
  try {
    const { module, page = 1, limit = 30 } = req.query;
    const filter = module ? { module } : {};
    const skip = (Number(page) - 1) * Number(limit);

    const [logs, total] = await Promise.all([
      ActivityLog.find(filter).populate("user", "name role").sort("-createdAt").skip(skip).limit(Number(limit)),
      ActivityLog.countDocuments(filter),
    ]);

    res.json({ success: true, data: logs, pagination: { total, page: Number(page), pages: Math.ceil(total / limit) } });
  } catch (error) {
    next(error);
  }
};
