import mongoose from "mongoose";
import ProductStock from "../models/ProductStock.js";
import StockMovement from "../models/StockMovement.js";
import Product from "../models/Product.js";
import Warehouse from "../models/Warehouse.js";
import { syncProductTotal } from "../utils/stockSync.js";
import { notify } from "../utils/notify.js";

// @route GET /api/inventory/overview  -> per-product, per-warehouse stock table
export const getStockOverview = async (req, res, next) => {
  try {
    const { warehouse, lowStockOnly, outOfStockOnly } = req.query;

    const filter = {};
    if (warehouse) filter.warehouse = warehouse;

    const stocks = await ProductStock.find(filter)
      .populate("product", "name sku lowStockThreshold price")
      .populate("warehouse", "name code")
      .sort("-updatedAt");

    let result = stocks;
    if (lowStockOnly === "true") {
      result = result.filter((s) => s.quantity > 0 && s.quantity <= (s.product?.lowStockThreshold || 5));
    }
    if (outOfStockOnly === "true") {
      result = result.filter((s) => s.quantity === 0);
    }

    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

// @route GET /api/inventory/history/:productId
export const getStockHistory = async (req, res, next) => {
  try {
    const movements = await StockMovement.find({ product: req.params.productId })
      .populate("warehouse", "name code")
      .populate("relatedWarehouse", "name code")
      .populate("performedBy", "name")
      .sort("-createdAt")
      .limit(100);
    res.json({ success: true, data: movements });
  } catch (error) {
    next(error);
  }
};

// @route POST /api/inventory/adjust
// body: { product, warehouse, quantity, type: "in"|"out"|"adjustment", batchNumber, expiryDate, reason }
export const adjustStock = async (req, res, next) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const { product, warehouse, quantity, type, batchNumber = "", expiryDate = null, reason = "" } = req.body;

    if (!product || !warehouse || !quantity || !type) {
      throw new Error("product, warehouse, quantity, and type are required");
    }

    const delta = type === "out" ? -Math.abs(quantity) : Math.abs(quantity);

    let stockDoc = await ProductStock.findOne({ product, warehouse, batchNumber }).session(session);
    if (!stockDoc) {
      if (delta < 0) throw new Error("Cannot remove stock that doesn't exist at this warehouse/batch");
      stockDoc = await ProductStock.create([{ product, warehouse, quantity: delta, batchNumber, expiryDate }], { session });
      stockDoc = stockDoc[0];
    } else {
      const newQty = stockDoc.quantity + delta;
      if (newQty < 0) throw new Error("Resulting stock cannot be negative");
      stockDoc.quantity = newQty;
      if (expiryDate) stockDoc.expiryDate = expiryDate;
      await stockDoc.save({ session });
    }

    await StockMovement.create(
      [{
        product, warehouse, type, quantity: Math.abs(quantity),
        batchNumber, expiryDate, reason, performedBy: req.user._id,
      }],
      { session }
    );

    const newTotal = await syncProductTotal(product, session);

    await session.commitTransaction();

    const io = req.app.get("io");
    io.emit("stock:updated");
    if (newTotal <= 5) {
  const productDoc = await Product.findById(product);
  await notify(io, { type: "low_stock", title: "Low Stock Alert", message: `${productDoc.name} is running low (${newTotal} left)`, link: "/inventory" });
}

    res.json({ success: true, data: stockDoc });
  } catch (error) {
    await session.abortTransaction();
    res.status(400).json({ success: false, message: error.message });
  } finally {
    session.endSession();
  }
};

// @route POST /api/inventory/transfer
// body: { product, fromWarehouse, toWarehouse, quantity, batchNumber, reason }
export const transferStock = async (req, res, next) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const { product, fromWarehouse, toWarehouse, quantity, batchNumber = "", reason = "" } = req.body;

    if (fromWarehouse === toWarehouse) throw new Error("Source and destination warehouses must differ");
    if (!quantity || quantity <= 0) throw new Error("Quantity must be greater than 0");

    const sourceStock = await ProductStock.findOne({ product, warehouse: fromWarehouse, batchNumber }).session(session);
    if (!sourceStock || sourceStock.quantity < quantity) {
      throw new Error("Insufficient stock at source warehouse");
    }

    sourceStock.quantity -= quantity;
    await sourceStock.save({ session });

    let destStock = await ProductStock.findOne({ product, warehouse: toWarehouse, batchNumber }).session(session);
    if (!destStock) {
      destStock = await ProductStock.create(
        [{ product, warehouse: toWarehouse, quantity, batchNumber, expiryDate: sourceStock.expiryDate }],
        { session }
      );
    } else {
      destStock.quantity += quantity;
      await destStock.save({ session });
    }

    await StockMovement.create(
      [
        { product, warehouse: fromWarehouse, type: "transfer_out", quantity, batchNumber, relatedWarehouse: toWarehouse, reason, performedBy: req.user._id },
        { product, warehouse: toWarehouse, type: "transfer_in", quantity, batchNumber, relatedWarehouse: fromWarehouse, reason, performedBy: req.user._id },
      ],
      { session }
    );

    await syncProductTotal(product, session);
    await session.commitTransaction();

    req.app.get("io").emit("stock:updated");

    res.json({ success: true, message: "Stock transferred successfully" });
  } catch (error) {
    await session.abortTransaction();
    res.status(400).json({ success: false, message: error.message });
  } finally {
    session.endSession();
  }
};

// @route GET /api/inventory/expiring?days=30
export const getExpiringStock = async (req, res, next) => {
  try {
    const days = Number(req.query.days) || 30;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() + days);

    const stocks = await ProductStock.find({
      expiryDate: { $ne: null, $lte: cutoff },
      quantity: { $gt: 0 },
    })
      .populate("product", "name sku")
      .populate("warehouse", "name code")
      .sort("expiryDate");

    res.json({ success: true, data: stocks });
  } catch (error) {
    next(error);
  }
};