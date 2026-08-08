import express from "express";
import {
  getStockOverview, getStockHistory, adjustStock, transferStock, getExpiringStock,
} from "../controllers/inventoryController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

const canManage = authorize("admin", "manager", "inventory_manager");

router.get("/overview", protect, getStockOverview);
router.get("/history/:productId", protect, getStockHistory);
router.get("/expiring", protect, getExpiringStock);
router.post("/adjust", protect, canManage, adjustStock);
router.post("/transfer", protect, canManage, transferStock);

export default router;