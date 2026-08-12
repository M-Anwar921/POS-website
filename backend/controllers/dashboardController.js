import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Customer from "../models/Customer.js";
import Expense from "../models/Expense.js";

const startOfDay = (d = new Date()) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };
const endOfDay = (d = new Date()) => { const x = new Date(d); x.setHours(23, 59, 59, 999); return x; };
const startOfMonth = () => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1); };

export const getDashboardOverview = async (req, res, next) => {
  try {
    const today = { $gte: startOfDay(), $lte: endOfDay() };
    const monthStart = startOfMonth();

    const [todayOrders, monthOrders, allProducts, customerCount, monthExpenses] = await Promise.all([
      Order.find({ createdAt: today, status: "completed" }),
      Order.find({ createdAt: { $gte: monthStart }, status: "completed" }),
      Product.find({ isArchived: false }),
      Customer.countDocuments(),
      Expense.find({ date: { $gte: monthStart } }),
    ]);

    const todaySales = todayOrders.reduce((s, o) => s + o.grandTotal, 0);
    const monthRevenue = monthOrders.reduce((s, o) => s + o.grandTotal, 0);
    const productsSoldToday = todayOrders.reduce((s, o) => s + o.items.reduce((si, i) => si + i.quantity, 0), 0);
    const lowStock = allProducts.filter((p) => p.stock > 0 && p.stock <= p.lowStockThreshold).length;
    const outOfStock = allProducts.filter((p) => p.stock === 0).length;
    const totalExpenses = monthExpenses.reduce((s, e) => s + e.amount, 0);

    // Rough profit estimate: revenue - cost of goods sold (from month orders) - expenses
    let cogs = 0;
    for (const o of monthOrders) {
      for (const item of o.items) {
        const product = allProducts.find((p) => p._id.toString() === item.product.toString());
        if (product) cogs += (product.cost || 0) * item.quantity;
      }
    }
    const profit = monthRevenue - cogs - totalExpenses;

    res.json({
      success: true,
      data: {
        todaySales,
        todayOrders: todayOrders.length,
        monthRevenue,
        productsSoldToday,
        totalCustomers: customerCount,
        lowStock,
        outOfStock,
        profit,
        totalExpenses,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getTopProducts = async (req, res, next) => {
  try {
    const monthStart = startOfMonth();
    const orders = await Order.find({ createdAt: { $gte: monthStart }, status: "completed" });

    const tally = {};
    for (const o of orders) {
      for (const item of o.items) {
        const key = item.product.toString();
        if (!tally[key]) tally[key] = { name: item.name, quantity: 0, revenue: 0 };
        tally[key].quantity += item.quantity;
        tally[key].revenue += item.lineTotal;
      }
    }

    const top = Object.values(tally).sort((a, b) => b.quantity - a.quantity).slice(0, 5);
    res.json({ success: true, data: top });
  } catch (error) {
    next(error);
  }
};

export const getRecentTransactions = async (req, res, next) => {
  try {
    const orders = await Order.find({ status: { $ne: "held" } })
      .populate("cashier", "name")
      .populate("customer", "name")
      .sort("-createdAt")
      .limit(10);
    res.json({ success: true, data: orders });
  } catch (error) {
    next(error);
  }
};

// @route GET /api/dashboard/sales-chart?days=7
export const getSalesChart = async (req, res, next) => {
  try {
    const days = Number(req.query.days) || 7;
    const results = [];

    for (let i = days - 1; i >= 0; i--) {
      const day = new Date();
      day.setDate(day.getDate() - i);
      const orders = await Order.find({ createdAt: { $gte: startOfDay(day), $lte: endOfDay(day) }, status: "completed" });
      results.push({
        date: day.toISOString().slice(0, 10),
        sales: orders.reduce((s, o) => s + o.grandTotal, 0),
        orders: orders.length,
      });
    }

    res.json({ success: true, data: results });
  } catch (error) {
    next(error);
  }
};

export const getInventoryStatus = async (req, res, next) => {
  try {
    const products = await Product.find({ isArchived: false });
    const inStock = products.filter((p) => p.stock > p.lowStockThreshold).length;
    const lowStock = products.filter((p) => p.stock > 0 && p.stock <= p.lowStockThreshold).length;
    const outOfStock = products.filter((p) => p.stock === 0).length;
    res.json({ success: true, data: { inStock, lowStock, outOfStock, total: products.length } });
  } catch (error) {
    next(error);
  }
};