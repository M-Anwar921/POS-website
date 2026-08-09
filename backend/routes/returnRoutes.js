import express from "express";
import { getReturns, createReturn, approveReturn, rejectReturn } from "../controllers/returnController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

router.get("/", protect, getReturns);
router.post("/", protect, createReturn);
router.put("/:id/approve", protect, authorize("admin", "manager"), approveReturn);
router.put("/:id/reject", protect, authorize("admin", "manager"), rejectReturn);

export default router;