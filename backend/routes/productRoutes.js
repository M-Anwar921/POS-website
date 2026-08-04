import express from "express";
import {
  getProducts, getProduct, getProductByBarcode,
  createProduct, updateProduct, archiveProduct,
} from "../controllers/productController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

router.get("/", protect, getProducts);
router.get("/barcode/:code", protect, getProductByBarcode);
router.get("/:id", protect, getProduct);
router.post("/", protect, authorize("admin", "manager", "inventory_manager"), createProduct);
router.put("/:id", protect, authorize("admin", "manager", "inventory_manager"), updateProduct);
router.delete("/:id", protect, authorize("admin", "manager"), archiveProduct);

export default router;