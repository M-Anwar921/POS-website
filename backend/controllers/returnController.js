import mongoose from "mongoose";
import Return from "../models/Return.js";
import Order from "../models/Order.js";
import ProductStock from "../models/ProductStock.js";
import StockMovement from "../models/StockMovement.js";
import Warehouse from "../models/Warehouse.js";
import { syncProductTotal } from "../utils/stockSync.js";

export const getReturns = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const returns = await Return.find(filter)
      .populate("order", "orderNumber grandTotal")
      .populate("requestedBy", "name")
      .populate("approvedBy", "name")
      .sort("-createdAt");
    res.json({ success: true, data: returns });
  } catch (error) {
    next(error);
  }
};

// @route POST /api/returns
// body: { order, items: [{ product, name, quantity, price }], reason, type }
export const createReturn = async (req, res, next) => {
  try {
    const { order: orderId, items, reason, type = "refund", notes = "" } = req.body;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    const refundAmount = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

    const returnDoc = await Return.create({
      order: orderId, items, reason, type, refundAmount, notes,
      requestedBy: req.user._id,
    });

    res.status(201).json({ success: true, data: returnDoc });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @route PUT /api/returns/:id/approve
export const approveReturn = async (req, res, next) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const returnDoc = await Return.findById(req.params.id).session(session);
    if (!returnDoc) throw new Error("Return not found");
    if (returnDoc.status !== "pending") throw new Error("Return has already been processed");

    const defaultWarehouse = await Warehouse.findOne({ isDefault: true }).session(session);

    for (const item of returnDoc.items) {
      let stockDoc = await ProductStock.findOne({ product: item.product, warehouse: defaultWarehouse._id }).session(session);
      if (!stockDoc) {
        stockDoc = await ProductStock.create([{ product: item.product, warehouse: defaultWarehouse._id, quantity: item.quantity }], { session });
      } else {
        stockDoc.quantity += item.quantity;
        await stockDoc.save({ session });
      }

      await StockMovement.create(
        [{
          product: item.product, warehouse: defaultWarehouse._id, type: "in", quantity: item.quantity,
          reason: `Return approved (${returnDoc._id})`, performedBy: req.user._id,
        }],
        { session }
      );

      await syncProductTotal(item.product, session);
    }

    returnDoc.status = "approved";
    returnDoc.approvedBy = req.user._id;
    await returnDoc.save({ session });

    const order = await Order.findById(returnDoc.order).session(session);
    const fullyReturned = returnDoc.items.reduce((sum, i) => sum + i.quantity, 0) >= order.items.reduce((sum, i) => sum + i.quantity, 0);
    order.status = fullyReturned ? "refunded" : "partially_refunded";
    order.statusHistory.push({ status: order.status, note: "Return approved", changedBy: req.user._id });
    await order.save({ session });

    await session.commitTransaction();

    req.app.get("io").emit("stock:updated");

    res.json({ success: true, data: returnDoc });
  } catch (error) {
    await session.abortTransaction();
    res.status(400).json({ success: false, message: error.message });
  } finally {
    session.endSession();
  }
};

// @route PUT /api/returns/:id/reject
export const rejectReturn = async (req, res, next) => {
  try {
    const returnDoc = await Return.findById(req.params.id);
    if (!returnDoc) return res.status(404).json({ success: false, message: "Return not found" });
    if (returnDoc.status !== "pending") return res.status(400).json({ success: false, message: "Return has already been processed" });

    returnDoc.status = "rejected";
    returnDoc.approvedBy = req.user._id;
    await returnDoc.save();

    res.json({ success: true, data: returnDoc });
  } catch (error) {
    next(error);
  }
};