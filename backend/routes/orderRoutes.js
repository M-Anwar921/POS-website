import express from "express";
import {
  createOrder, holdOrder, getHeldOrders, deleteHeldOrder, getOrders,
} from "../controllers/orderController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.get("/", protect, getOrders);
router.get("/held", protect, getHeldOrders);
router.post("/", protect, createOrder);
router.post("/hold", protect, holdOrder);
router.delete("/held/:id", protect, deleteHeldOrder);

export default router;