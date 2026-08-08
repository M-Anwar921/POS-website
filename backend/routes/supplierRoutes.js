import express from "express";
import {
  getSuppliers, getSupplier, createSupplier, updateSupplier, deleteSupplier,
  createInvoice, recordPayment,
} from "../controllers/supplierController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

const canManage = authorize("admin", "manager", "accountant");

router.get("/", protect, getSuppliers);
router.get("/:id", protect, getSupplier);
router.post("/", protect, canManage, createSupplier);
router.put("/:id", protect, canManage, updateSupplier);
router.delete("/:id", protect, authorize("admin", "manager"), deleteSupplier);
router.post("/:id/invoices", protect, canManage, createInvoice);
router.post("/:id/payments", protect, canManage, recordPayment);

export default router;