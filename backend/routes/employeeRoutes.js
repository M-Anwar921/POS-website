import express from "express";
import { getEmployees, getEmployee, createEmployee, updateEmployee, getPerformance } from "../controllers/employeeController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

const adminOnly = authorize("admin", "manager");

router.get("/", protect, adminOnly, getEmployees);
router.get("/:id", protect, adminOnly, getEmployee);
router.get("/:id/performance", protect, adminOnly, getPerformance);
router.post("/", protect, authorize("admin"), createEmployee);
router.put("/:id", protect, adminOnly, updateEmployee);

export default router;