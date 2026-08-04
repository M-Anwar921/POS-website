import mongoose from "mongoose";
import dotenv from "dotenv";
import Category from "./models/Category.js";
import Product from "./models/Product.js";

dotenv.config();

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected. Seeding...");

  await Category.deleteMany({});
  await Product.deleteMany({});

  const categories = await Category.insertMany([
    { name: "Beverages", color: "#2563EB" },
    { name: "Snacks", color: "#F59E0B" },
    { name: "Groceries", color: "#10B981" },
    { name: "Household", color: "#EF4444" },
  ]);

  const [bev, snacks, groceries, household] = categories;

  await Product.insertMany([
    { name: "Coca Cola 500ml", sku: "BEV-001", barcode: "8901234500011", category: bev._id, price: 120, cost: 80, stock: 50 },
    { name: "Mineral Water 1.5L", sku: "BEV-002", barcode: "8901234500028", category: bev._id, price: 80, cost: 50, stock: 100 },
    { name: "Orange Juice 1L", sku: "BEV-003", barcode: "8901234500035", category: bev._id, price: 250, cost: 180, stock: 30 },
    { name: "Potato Chips", sku: "SNK-001", barcode: "8901234500042", category: snacks._id, price: 100, cost: 60, stock: 4 },
    { name: "Chocolate Bar", sku: "SNK-002", barcode: "8901234500059", category: snacks._id, price: 150, cost: 90, stock: 40 },
    { name: "Biscuits Pack", sku: "SNK-003", barcode: "8901234500066", category: snacks._id, price: 90, cost: 55, stock: 60 },
    { name: "Rice 5kg", sku: "GRO-001", barcode: "8901234500073", category: groceries._id, price: 1200, cost: 950, stock: 20 },
    { name: "Cooking Oil 1L", sku: "GRO-002", barcode: "8901234500080", category: groceries._id, price: 650, cost: 500, stock: 25 },
    { name: "Sugar 1kg", sku: "GRO-003", barcode: "8901234500097", category: groceries._id, price: 180, cost: 140, stock: 3 },
    { name: "Dish Soap", sku: "HH-001", barcode: "8901234500103", category: household._id, price: 220, cost: 150, stock: 35 },
    { name: "Laundry Detergent", sku: "HH-002", barcode: "8901234500110", category: household._id, price: 480, cost: 350, stock: 15 },
    { name: "Tissue Paper Pack", sku: "HH-003", barcode: "8901234500127", category: household._id, price: 300, cost: 200, stock: 45 },
  ]);

  console.log("Seed complete: 4 categories, 12 products.");
  process.exit();
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});