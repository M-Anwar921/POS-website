import mongoose from "mongoose";
import Order from "../models/Order.js";
import Product from "../models/Product.js";

const generateOrderNumber = async () => {
  const count = await Order.countDocuments();
  const date = new Date();
  const stamp = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}`;
  return `ORD-${stamp}-${String(count + 1).padStart(4, "0")}`;
};

const calculateTotals = (items, discountType, discountValue, taxPercent) => {
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const discountAmount = discountType === "percent" ? (subtotal * discountValue) / 100 : discountValue;
  const taxableAmount = Math.max(subtotal - discountAmount, 0);
  const taxAmount = (taxableAmount * taxPercent) / 100;
  const grandTotal = taxableAmount + taxAmount;
  return { subtotal, discountAmount, taxAmount, grandTotal };
};

// @route POST /api/orders  (status = completed)
export const createOrder = async (req, res, next) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const {
      items, customer, discountType = "flat", discountValue = 0,
      taxPercent = 0, paymentMethod = "cash", paymentDetails = {}, amountTendered = 0,
    } = req.body;

    if (!items || items.length === 0) {
      throw new Error("Order must contain at least one item");
    }

    // Validate stock and lock in prices from DB (not client-supplied)
    const productDocs = await Product.find({ _id: { $in: items.map((i) => i.product) } }).session(session);
    const productMap = new Map(productDocs.map((p) => [p._id.toString(), p]));

    const orderItems = items.map((i) => {
      const product = productMap.get(i.product);
      if (!product) throw new Error(`Product not found: ${i.product}`);
      if (product.stock < i.quantity) throw new Error(`Insufficient stock for ${product.name}`);
      return {
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: i.quantity,
        lineTotal: product.price * i.quantity,
      };
    });

    const { subtotal, discountAmount, taxAmount, grandTotal } = calculateTotals(
      orderItems, discountType, discountValue, taxPercent
    );

    const changeDue = paymentMethod === "cash" ? Math.max(amountTendered - grandTotal, 0) : 0;

    const order = await Order.create(
      [{
        orderNumber: await generateOrderNumber(),
        items: orderItems,
        customer: customer || null,
        cashier: req.user._id,
        subtotal, discountType, discountValue, discountAmount,
        taxPercent, taxAmount, grandTotal,
        paymentMethod, paymentDetails, amountTendered, changeDue,
        status: "completed",
      }],
      { session }
    );

    // Reduce stock
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } }, { session });
    }

    await session.commitTransaction();

    const io = req.app.get("io");
    io.emit("stock:updated");
    io.emit("order:created", order[0]);

    res.status(201).json({ success: true, data: order[0] });
  } catch (error) {
    await session.abortTransaction();
    res.status(400).json({ success: false, message: error.message });
  } finally {
    session.endSession();
  }
};

// @route POST /api/orders/hold  (status = held, no stock deduction)
export const holdOrder = async (req, res, next) => {
  try {
    const { items, customer, discountType = "flat", discountValue = 0, taxPercent = 0 } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: "Cannot hold an empty cart" });
    }

    const { subtotal, discountAmount, taxAmount, grandTotal } = calculateTotals(
      items, discountType, discountValue, taxPercent
    );

    const order = await Order.create({
      orderNumber: await generateOrderNumber(),
      items,
      customer: customer || null,
      cashier: req.user._id,
      subtotal, discountType, discountValue, discountAmount,
      taxPercent, taxAmount, grandTotal,
      status: "held",
    });

    res.status(201).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

// @route GET /api/orders/held
export const getHeldOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ status: "held" }).populate("customer", "name phone").sort("-createdAt");
    res.json({ success: true, data: orders });
  } catch (error) {
    next(error);
  }
};

// @route DELETE /api/orders/held/:id  (resume: client re-adds items to cart, then deletes hold)
export const deleteHeldOrder = async (req, res, next) => {
  try {
    await Order.findOneAndDelete({ _id: req.params.id, status: "held" });
    res.json({ success: true, message: "Held order removed" });
  } catch (error) {
    next(error);
  }
};

// @route GET /api/orders
export const getOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const filter = status ? { status } : { status: { $ne: "held" } };
    const skip = (Number(page) - 1) * Number(limit);

    const [orders, total] = await Promise.all([
      Order.find(filter).populate("customer", "name phone").populate("cashier", "name")
        .sort("-createdAt").skip(skip).limit(Number(limit)),
      Order.countDocuments(filter),
    ]);

    res.json({ success: true, data: orders, pagination: { total, page: Number(page), pages: Math.ceil(total / limit) } });
  } catch (error) {
    next(error);
  }
};