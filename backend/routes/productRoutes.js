import express from "express";
import {
  getProducts, getProduct, getProductByBarcode, getArchivedProducts,
  createProduct, updateProduct, archiveProduct, restoreProduct,
  duplicateProduct, uploadProductImage, bulkImportProducts, bulkExportProducts,
} from "../controllers/productController.js";
import { protect, authorize } from "../middleware/auth.js";
import { upload } from "../config/cloudinary.js";
import { uploadCsv } from "../middleware/uploadCsv.js";

const router = express.Router();

const canManage = authorize("admin", "manager", "inventory_manager");

router.get("/", protect, getProducts);
router.get("/archived", protect, canManage, getArchivedProducts);
router.get("/bulk-export", protect, canManage, bulkExportProducts);
router.get("/barcode/:code", protect, getProductByBarcode);
router.get("/:id", protect, getProduct);

router.post("/", protect, canManage, createProduct);
router.post("/upload-image", protect, canManage, upload.single("image"), uploadProductImage);
router.post("/bulk-import", protect, canManage, uploadCsv.single("file"), bulkImportProducts);
router.post("/:id/duplicate", protect, canManage, duplicateProduct);

router.put("/:id", protect, canManage, updateProduct);
router.put("/:id/restore", protect, canManage, restoreProduct);

router.delete("/:id", protect, authorize("admin", "manager"), archiveProduct);

export default router;