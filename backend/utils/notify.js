import Notification from "../models/Notification.js";

export const notify = async (io, { type, title, message, link = "" }) => {
  try {
    const notification = await Notification.create({ type, title, message, link });
    io.emit("notification:new", notification);
    return notification;
  } catch (err) {
    console.error("Failed to create notification:", err.message);
  }
};