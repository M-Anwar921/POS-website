import express from "express";
import {
  getCustomers, getCustomer, createCustomer, updateCustomer,
  adjustLoyaltyPoints, adjustCreditBalance, deleteCustomer,
} from "../controllers/customerController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

router.get("/", protect, getCustomers);
router.get("/:id", protect, getCustomer);
router.post("/", protect, createCustomer);
router.put("/:id", protect, updateCustomer);
router.post("/:id/loyalty", protect, authorize("admin", "manager", "cashier"), adjustLoyaltyPoints);
router.post("/:id/credit", protect, authorize("admin", "manager", "accountant"), adjustCreditBalance);
router.delete("/:id", protect, authorize("admin", "manager"), deleteCustomer);

export default router;