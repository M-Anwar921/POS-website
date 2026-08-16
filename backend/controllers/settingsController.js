import crypto from "crypto";
import Settings from "../models/Settings.js";
import { logActivity } from "../utils/logActivity.js";

// Ensures exactly one settings document ever exists
const getOrCreateSettings = async () => {
  let settings = await Settings.findOne();
  if (!settings) settings = await Settings.create({});
  return settings;
};

export const getSettings = async (req, res, next) => {
  try {
    const settings = await getOrCreateSettings();
    res.json({ success: true, data: settings });
  } catch (error) {
    next(error);
  }
};

export const updateSettings = async (req, res, next) => {
  try {
    const settings = await getOrCreateSettings();
    Object.assign(settings, req.body);
    await settings.save();

    await logActivity(req.user._id, "updated settings", "Settings");

    res.json({ success: true, data: settings });
  } catch (error) {
    next(error);
  }
};

// @route POST /api/settings/generate-api-key
export const generateApiKey = async (req, res, next) => {
  try {
    const settings = await getOrCreateSettings();
    settings.apiKey = crypto.randomBytes(24).toString("hex");
    await settings.save();

    await logActivity(req.user._id, "regenerated API key", "Settings");

    res.json({ success: true, data: { apiKey: settings.apiKey } });
  } catch (error) {
    next(error);
  }
};