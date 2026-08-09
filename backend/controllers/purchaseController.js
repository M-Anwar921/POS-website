import mongoose from "mongoose";
import PurchaseOrder from "../models/PurchaseOrder.js";
import ProductStock from "../models/ProductStock.js";
import StockMovement from "../models/StockMovement.js";
import { syncProductTotal } from "../utils/stockSync.js";
import { uploadBufferToCloudinary } from "../config/cloudinary.js";

const generatePoNumber = async () => {
  const count = await PurchaseOrder.countDocuments();
  const date = new Date();
  const stamp = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}`;
  return `PO-${stamp}-${String(count + 1).padStart(4, "0")}`;
};

export const getPurchaseOrders = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const orders = await PurchaseOrder.find(filter)
      .populate("supplier", "name")
      .populate("createdBy", "name")
      .sort("-createdAt");
    res.json({ success: true, data: orders });
  } catch (error) {
    next(error);
  }
};

export const getPurchaseOrder = async (req, res, next) => {
  try {
    const order = await PurchaseOrder.findById(req.params.id).populate("supplier", "name phone").populate("createdBy", "name");
    if (!order) return res.status(404).json({ success: false, message: "Purchase order not found" });
    res.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

export const createPurchaseOrder = async (req, res, next) => {
  try {
    const { supplier, items, expectedDate, notes } = req.body;
    if (!items || items.length === 0) throw new Error("Purchase order must have at least one item");

    const totalAmount = items.reduce((sum, i) => sum + i.unitCost * i.quantity, 0);

    const po = await PurchaseOrder.create({
      poNumber: await generatePoNumber(),
      supplier, items, totalAmount, expectedDate, notes,
      createdBy: req.user._id,
    });

    res.status(201).json({ success: true, data: po });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @route POST /api/purchases/upload-invoice  (multipart, field "invoice")
export const uploadInvoice = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: "No file provided" });
    const result = await uploadBufferToCloudinary(req.file.buffer);
    res.json({ success: true, data: { url: result.secure_url } });
  } catch (error) {
    next(error);
  }
};

// @route POST /api/purchases/:id/receive
// body: { warehouse, items: [{ product, quantity }] }
export const receiveStock = async (req, res, next) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const { warehouse, items } = req.body;
    if (!warehouse || !items || items.length === 0) throw new Error("warehouse and items are required");

    const po = await PurchaseOrder.findById(req.params.id).session(session);
    if (!po) throw new Error("Purchase order not found");
    if (po.status === "received" || po.status === "cancelled") {
      throw new Error(`Cannot receive stock on a ${po.status} purchase order`);
    }

    for (const receiveItem of items) {
      const poItem = po.items.find((i) => i.product.toString() === receiveItem.product);
      if (!poItem) throw new Error("Item not found on this purchase order");

      const remaining = poItem.quantity - poItem.receivedQuantity;
      if (receiveItem.quantity > remaining) {
        throw new Error(`Cannot receive more than remaining quantity (${remaining}) for ${poItem.name}`);
      }

      poItem.receivedQuantity += receiveItem.quantity;

      let stockDoc = await ProductStock.findOne({ product: poItem.product, warehouse }).session(session);
      if (!stockDoc) {
        stockDoc = await ProductStock.create([{ product: poItem.product, warehouse, quantity: receiveItem.quantity }], { session });
      } else {
        stockDoc.quantity += receiveItem.quantity;
        await stockDoc.save({ session });
      }

      await StockMovement.create(
        [{
          product: poItem.product, warehouse, type: "in", quantity: receiveItem.quantity,
          reason: `Received from PO ${po.poNumber}`, performedBy: req.user._id,
        }],
        { session }
      );

      await syncProductTotal(poItem.product, session);
    }

    const allReceived = po.items.every((i) => i.receivedQuantity >= i.quantity);
    const anyReceived = po.items.some((i) => i.receivedQuantity > 0);
    po.status = allReceived ? "received" : anyReceived ? "partial" : po.status;
    await po.save({ session });

    await session.commitTransaction();

    req.app.get("io").emit("stock:updated");

    res.json({ success: true, data: po });
  } catch (error) {
    await session.abortTransaction();
    res.status(400).json({ success: false, message: error.message });
  } finally {
    session.endSession();
  }
};

export const cancelPurchaseOrder = async (req, res, next) => {
  try {
    const po = await PurchaseOrder.findById(req.params.id);
    if (!po) return res.status(404).json({ success: false, message: "Purchase order not found" });
    if (po.status === "received" || po.status === "partial") {
      return res.status(400).json({ success: false, message: "Cannot cancel a PO that has already received stock" });
    }
    po.status = "cancelled";
    await po.save();
    res.json({ success: true, data: po });
  } catch (error) {
    next(error);
  }
};