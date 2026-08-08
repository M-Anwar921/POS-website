import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import { createServer } from "http";
import { Server } from "socket.io";

import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";
import productRoutes from "./routes/productRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import customerRoutes from "./routes/customerRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import warehouseRoutes from "./routes/warehouseRoutes.js";
import inventoryRoutes from "./routes/inventoryRoutes.js";
import supplierRoutes from "./routes/supplierRoutes.js";

dotenv.config();
connectDB();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: process.env.CLIENT_URL, credentials: true },
});

app.set("io", io);

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 300 });
app.use("/api", limiter);

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/orders", orderRoutes);
app.get("/api/health", (req, res) => res.json({ success: true, message: "API is running" }));
app.use("/api/warehouses", warehouseRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/suppliers", supplierRoutes);

io.on("connection", (socket) => {
  console.log(`Socket connected: ${socket.id}`);
  socket.on("disconnect", () => console.log(`Socket disconnected: ${socket.id}`));
});

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));