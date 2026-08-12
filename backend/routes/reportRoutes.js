import express from "express";
import {
  getSalesReport, getEmployeeSalesReport, getInventoryReport,
  getProfitLossReport, getTopCustomersReport, exportReport,
} from "../controllers/reportController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

const canView = authorize("admin", "manager", "accountant");

router.get("/sales", protect, canView, getSalesReport);
router.get("/employee-sales", protect, canView, getEmployeeSalesReport);
router.get("/inventory", protect, canView, getInventoryReport);
router.get("/profit-loss", protect, canView, getProfitLossReport);
router.get("/top-customers", protect, canView, getTopCustomersReport);
router.get("/export", protect, canView, exportReport);

export default router;