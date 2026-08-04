import express from "express";
import { getCategories, createCategory, updateCategory, deleteCategory } from "../controllers/categoryController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

router.get("/", protect, getCategories);
router.post("/", protect, authorize("admin", "manager"), createCategory);
router.put("/:id", protect, authorize("admin", "manager"), updateCategory);
router.delete("/:id", protect, authorize("admin", "manager"), deleteCategory);

export default router;