import express from "express";
import { getSalaryPayments, createSalaryPayment } from "../controllers/salaryController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

router.get("/", protect, authorize("admin", "manager", "accountant"), getSalaryPayments);
router.post("/", protect, authorize("admin", "accountant"), createSalaryPayment);

export default router;