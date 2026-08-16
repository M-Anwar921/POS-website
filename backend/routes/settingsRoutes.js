import express from "express";
import { getSettings, updateSettings, generateApiKey } from "../controllers/settingsController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

router.get("/", protect, getSettings);
router.put("/", protect, authorize("admin"), updateSettings);
router.post("/generate-api-key", protect, authorize("admin"), generateApiKey);

export default router;