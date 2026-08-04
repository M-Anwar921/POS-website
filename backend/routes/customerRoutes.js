import express from "express";
import { getCustomers, createCustomer } from "../controllers/customerController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.get("/", protect, getCustomers);
router.post("/", protect, createCustomer);

export default router;