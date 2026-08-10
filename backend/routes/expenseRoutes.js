import express from "express";
import {
  getExpenses, createExpense, updateExpense, deleteExpense, getMonthlyReport,
} from "../controllers/expenseController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

const canManage = authorize("admin", "manager", "accountant");

router.get("/", protect, getExpenses);
router.get("/report", protect, getMonthlyReport);
router.post("/", protect, canManage, createExpense);
router.put("/:id", protect, canManage, updateExpense);
router.delete("/:id", protect, authorize("admin", "manager"), deleteExpense);

export default router;