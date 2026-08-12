import { Parser as CsvParser } from "json2csv";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Expense from "../models/Expense.js";
import User from "../models/User.js";

const getRange = (period, dateStr) => {
  const base = dateStr ? new Date(dateStr) : new Date();
  let start, end;
  if (period === "daily") {
    start = new Date(base); start.setHours(0, 0, 0, 0);
    end = new Date(base); end.setHours(23, 59, 59, 999);
  } else if (period === "weekly") {
    start = new Date(base); start.setDate(base.getDate() - base.getDay());
    start.setHours(0, 0, 0, 0);
    end = new Date(start); end.setDate(start.getDate() + 6); end.setHours(23, 59, 59, 999);
  } else if (period === "monthly") {
    start = new Date(base.getFullYear(), base.getMonth(), 1);
    end = new Date(base.getFullYear(), base.getMonth() + 1, 0, 23, 59, 59, 999);
  } else if (period === "yearly") {
    start = new Date(base.getFullYear(), 0, 1);
    end = new Date(base.getFullYear(), 11, 31, 23, 59, 59, 999);
  }
  return { start, end };
};

// @route GET /api/reports/sales?period=daily|weekly|monthly|yearly&date=
export const getSalesReport = async (req, res, next) => {
  try {
    const { period = "monthly", date } = req.query;
    const { start, end } = getRange(period, date);

    const orders = await Order.find({ createdAt: { $gte: start, $lte: end }, status: { $in: ["completed", "partially_refunded"] } });
    const totalSales = orders.reduce((s, o) => s + o.grandTotal, 0);
    const totalTax = orders.reduce((s, o) => s + o.taxAmount, 0);
    const totalDiscount = orders.reduce((s, o) => s + o.discountAmount, 0);

    res.json({
      success: true,
      data: { period, start, end, totalSales, totalOrders: orders.length, totalTax, totalDiscount, orders },
    });
  } catch (error) {
    next(error);
  }
};

// @route GET /api/reports/employee-sales?period=&date=
export const getEmployeeSalesReport = async (req, res, next) => {
  try {
    const { period = "monthly", date } = req.query;
    const { start, end } = getRange(period, date);

    const orders = await Order.find({ createdAt: { $gte: start, $lte: end }, status: "completed" }).populate("cashier", "name role");

    const tally = {};
    for (const o of orders) {
      const key = o.cashier?._id?.toString() || "unknown";
      if (!tally[key]) tally[key] = { name: o.cashier?.name || "Unknown", role: o.cashier?.role, orders: 0, sales: 0 };
      tally[key].orders += 1;
      tally[key].sales += o.grandTotal;
    }

    res.json({ success: true, data: Object.values(tally).sort((a, b) => b.sales - a.sales) });
  } catch (error) {
    next(error);
  }
};

// @route GET /api/reports/inventory
export const getInventoryReport = async (req, res, next) => {
  try {
    const products = await Product.find({ isArchived: false }).populate("category", "name");
    const data = products.map((p) => ({
      name: p.name, sku: p.sku, category: p.category?.name || "—",
      stock: p.stock, price: p.price, cost: p.cost,
      stockValue: p.stock * p.cost,
      status: p.stock === 0 ? "Out of Stock" : p.stock <= p.lowStockThreshold ? "Low Stock" : "In Stock",
    }));
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

// @route GET /api/reports/profit-loss?period=&date=
export const getProfitLossReport = async (req, res, next) => {
  try {
    const { period = "monthly", date } = req.query;
    const { start, end } = getRange(period, date);

    const orders = await Order.find({ createdAt: { $gte: start, $lte: end }, status: "completed" });
    const products = await Product.find({});
    const expenses = await Expense.find({ date: { $gte: start, $lte: end } });

    const revenue = orders.reduce((s, o) => s + o.grandTotal, 0);
    let cogs = 0;
    for (const o of orders) {
      for (const item of o.items) {
        const product = products.find((p) => p._id.toString() === item.product.toString());
        if (product) cogs += (product.cost || 0) * item.quantity;
      }
    }
    const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
    const grossProfit = revenue - cogs;
    const netProfit = grossProfit - totalExpenses;

    res.json({ success: true, data: { period, start, end, revenue, cogs, grossProfit, totalExpenses, netProfit } });
  } catch (error) {
    next(error);
  }
};

// @route GET /api/reports/top-customers?limit=10
export const getTopCustomersReport = async (req, res, next) => {
  try {
    const orders = await Order.find({ status: "completed", customer: { $ne: null } }).populate("customer", "name phone");

    const tally = {};
    for (const o of orders) {
      const key = o.customer?._id?.toString();
      if (!key) continue;
      if (!tally[key]) tally[key] = { name: o.customer.name, phone: o.customer.phone, orders: 0, totalSpent: 0 };
      tally[key].orders += 1;
      tally[key].totalSpent += o.grandTotal;
    }

    const top = Object.values(tally).sort((a, b) => b.totalSpent - a.totalSpent).slice(0, Number(req.query.limit) || 10);
    res.json({ success: true, data: top });
  } catch (error) {
    next(error);
  }
};

// @route GET /api/reports/export?type=sales|inventory|profit-loss&period=&date=
export const exportReport = async (req, res, next) => {
  try {
    const { type = "sales", period = "monthly", date } = req.query;
    let rows = [];
    let fields = [];

    if (type === "sales") {
      const { start, end } = getRange(period, date);
      const orders = await Order.find({ createdAt: { $gte: start, $lte: end }, status: { $in: ["completed", "partially_refunded"] } });
      rows = orders.map((o) => ({
        orderNumber: o.orderNumber, date: o.createdAt.toISOString().slice(0, 10),
        subtotal: o.subtotal, discount: o.discountAmount, tax: o.taxAmount, total: o.grandTotal, status: o.status,
      }));
      fields = ["orderNumber", "date", "subtotal", "discount", "tax", "total", "status"];
    } else if (type === "inventory") {
      const products = await Product.find({ isArchived: false }).populate("category", "name");
      rows = products.map((p) => ({
        name: p.name, sku: p.sku, category: p.category?.name || "", stock: p.stock, price: p.price, cost: p.cost,
      }));
      fields = ["name", "sku", "category", "stock", "price", "cost"];
    } else if (type === "profit-loss") {
      const { start, end } = getRange(period, date);
      const orders = await Order.find({ createdAt: { $gte: start, $lte: end }, status: "completed" });
      const products = await Product.find({});
      const expenses = await Expense.find({ date: { $gte: start, $lte: end } });
      const revenue = orders.reduce((s, o) => s + o.grandTotal, 0);
      let cogs = 0;
      for (const o of orders) for (const item of o.items) {
        const p = products.find((pr) => pr._id.toString() === item.product.toString());
        if (p) cogs += (p.cost || 0) * item.quantity;
      }
      const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
      rows = [{ revenue, cogs, grossProfit: revenue - cogs, totalExpenses, netProfit: revenue - cogs - totalExpenses }];
      fields = ["revenue", "cogs", "grossProfit", "totalExpenses", "netProfit"];
    }

    const parser = new CsvParser({ fields });
    const csv = parser.parse(rows);
    res.header("Content-Type", "text/csv");
    res.attachment(`${type}-report-${Date.now()}.csv`);
    res.send(csv);
  } catch (error) {
    next(error);
  }
};