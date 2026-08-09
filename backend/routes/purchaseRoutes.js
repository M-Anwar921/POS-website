import express from "express";
import {
  getPurchaseOrders, getPurchaseOrder, createPurchaseOrder,
  receiveStock, cancelPurchaseOrder, uploadInvoice,
} from "../controllers/purchaseController.js";
import { protect, authorize } from "../middleware/auth.js";
import { upload } from "../config/cloudinary.js";

const router = express.Router();

const canManage = authorize("admin", "manager", "inventory_manager");

router.get("/", protect, getPurchaseOrders);
router.get("/:id", protect, getPurchaseOrder);
router.post("/", protect, canManage, createPurchaseOrder);
router.post("/upload-invoice", protect, canManage, upload.single("invoice"), uploadInvoice);
router.post("/:id/receive", protect, canManage, receiveStock);
router.put("/:id/cancel", protect, canManage, cancelPurchaseOrder);

export default router;
