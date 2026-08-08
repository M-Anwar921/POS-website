import express from "express";
import { getWarehouses, createWarehouse, updateWarehouse, deleteWarehouse } from "../controllers/warehouseController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

router.get("/", protect, getWarehouses);
router.post("/", protect, authorize("admin", "manager", "inventory_manager"), createWarehouse);
router.put("/:id", protect, authorize("admin", "manager", "inventory_manager"), updateWarehouse);
router.delete("/:id", protect, authorize("admin", "manager"), deleteWarehouse);

export default router;