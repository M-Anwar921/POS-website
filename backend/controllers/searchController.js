import Product from "../models/Product.js";
import Customer from "../models/Customer.js";
import Order from "../models/Order.js";
import Supplier from "../models/Supplier.js";

// @route GET /api/search?q=
export const globalSearch = async (req, res, next) => {
  try {
    const q = req.query.q?.trim();
    if (!q || q.length < 2) return res.json({ success: true, data: { products: [], customers: [], orders: [], suppliers: [] } });

    const regex = { $regex: q, $options: "i" };

    const [products, customers, orders, suppliers] = await Promise.all([
      Product.find({ $or: [{ name: regex }, { sku: regex }, { barcode: regex }] }).limit(5),
      Customer.find({ $or: [{ name: regex }, { phone: regex }] }).limit(5),
      Order.find({ orderNumber: regex }).limit(5),
      Supplier.find({ name: regex }).limit(5),
    ]);

    res.json({ success: true, data: { products, customers, orders, suppliers } });
  } catch (error) {
    next(error);
  }
};