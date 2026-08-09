import mongoose from "mongoose";
import Product from "../models/Product.js";
import ProductStock from "../models/ProductStock.js";

export const syncProductTotal = async (productId, session) => {
  const rows = await ProductStock.aggregate([
    { $match: { product: new mongoose.Types.ObjectId(productId) } },
    { $group: { _id: "$product", total: { $sum: "$quantity" } } },
  ]).session(session);
  const total = rows[0]?.total || 0;
  await Product.findByIdAndUpdate(productId, { stock: total }, { session });
  return total;
};