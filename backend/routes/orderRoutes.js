import express from "express";
import {
  createOrder, holdOrder, getHeldOrders, deleteHeldOrder, getOrders,
  getOrder, updateOrderStatus,
} from "../controllers/orderController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

router.get("/", protect, getOrders);
router.get("/held", protect, getHeldOrders);
router.get("/:id", protect, getOrder);
router.post("/", protect, createOrder);
router.post("/hold", protect, holdOrder);
router.put("/:id/status", protect, authorize("admin", "manager"), updateOrderStatus);
router.delete("/held/:id", protect, deleteHeldOrder);

export default router;