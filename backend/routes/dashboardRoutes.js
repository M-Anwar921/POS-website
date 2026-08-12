import express from "express";
import {
  getDashboardOverview, getTopProducts, getRecentTransactions, getSalesChart, getInventoryStatus,
} from "../controllers/dashboardController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.get("/overview", protect, getDashboardOverview);
router.get("/top-products", protect, getTopProducts);
router.get("/recent-transactions", protect, getRecentTransactions);
router.get("/sales-chart", protect, getSalesChart);
router.get("/inventory-status", protect, getInventoryStatus);

export default router;