import express from "express";
import { getAttendance, checkIn, checkOut, markAttendance } from "../controllers/attendanceController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

router.get("/", protect, authorize("admin", "manager"), getAttendance);
router.post("/checkin", protect, checkIn);
router.post("/checkout", protect, checkOut);
router.post("/mark", protect, authorize("admin", "manager"), markAttendance);

export default router;