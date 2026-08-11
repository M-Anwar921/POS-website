import express from "express";
import { getShifts, createShift, updateShift, deleteShift } from "../controllers/shiftController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

const canManage = authorize("admin", "manager");

router.get("/", protect, getShifts);
router.post("/", protect, canManage, createShift);
router.put("/:id", protect, canManage, updateShift);
router.delete("/:id", protect, canManage, deleteShift);

export default router;