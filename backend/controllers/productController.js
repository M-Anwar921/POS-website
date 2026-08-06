import { parse } from "csv-parse/sync";
import { Parser as CsvParser } from "json2csv";
import Product from "../models/Product.js";
import { uploadBufferToCloudinary } from "../config/cloudinary.js";

const generateBarcode = () => {
  return Math.floor(1000000000000 + Math.random() * 9000000000000).toString();
};

export const getProducts = async (req, res, next) => {
  try {
    const { search = "", category, page = 1, limit = 50 } = req.query;

    const filter = { isArchived: false };
    if (category) filter.category = category;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { sku: { $regex: search, $options: "i" } },
        { barcode: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [products, total] = await Promise.all([
      Product.find(filter).populate("category", "name color").sort("-createdAt").skip(skip).limit(Number(limit)),
      Product.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: products,
      pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) },
    });
  } catch (error) {
    next(error);
  }
};

export const getArchivedProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ isArchived: true }).populate("category", "name color").sort("-updatedAt");
    res.json({ success: true, data: products });
  } catch (error) {
    next(error);
  }
};

export const getProductByBarcode = async (req, res, next) => {
  try {
    const product = await Product.findOne({ barcode: req.params.code, isArchived: false });
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    res.json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

export const getProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate("category", "name color");
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    res.json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (req, res, next) => {
  try {
    const payload = { ...req.body };
    if (!payload.barcode) payload.barcode = generateBarcode();
    const product = await Product.create(payload);
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    res.json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

export const archiveProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, { isArchived: true }, { new: true });
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    res.json({ success: true, message: "Product archived" });
  } catch (error) {
    next(error);
  }
};

export const restoreProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, { isArchived: false }, { new: true });
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    res.json({ success: true, message: "Product restored" });
  } catch (error) {
    next(error);
  }
};

export const duplicateProduct = async (req, res, next) => {
  try {
    const original = await Product.findById(req.params.id).lean();
    if (!original) return res.status(404).json({ success: false, message: "Product not found" });

    delete original._id;
    delete original.createdAt;
    delete original.updatedAt;

    const duplicate = await Product.create({
      ...original,
      name: `${original.name} (Copy)`,
      sku: `${original.sku}-COPY-${Date.now().toString().slice(-4)}`,
      barcode: generateBarcode(),
    });

    res.status(201).json({ success: true, data: duplicate });
  } catch (error) {
    next(error);
  }
};

export const uploadProductImage = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: "No image provided" });
    const result = await uploadBufferToCloudinary(req.file.buffer);
    res.json({ success: true, data: { url: result.secure_url, publicId: result.public_id } });
  } catch (error) {
    next(error);
  }
};

// @route POST /api/products/bulk-import  (multipart CSV, field name "file")
// Expected CSV columns: name,sku,barcode,price,cost,stock,category
export const bulkImportProducts = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: "No CSV file provided" });

    const records = parse(req.file.buffer.toString(), { columns: true, skip_empty_lines: true, trim: true });

    const results = { created: 0, skipped: 0, errors: [] };

    for (const row of records) {
      try {
        if (!row.name || !row.sku || !row.price) {
          results.skipped++;
          results.errors.push(`Row skipped (missing required field): ${JSON.stringify(row)}`);
          continue;
        }
        await Product.create({
          name: row.name,
          sku: row.sku,
          barcode: row.barcode || generateBarcode(),
          price: Number(row.price),
          cost: Number(row.cost) || 0,
          stock: Number(row.stock) || 0,
        });
        results.created++;
      } catch (err) {
        results.skipped++;
        results.errors.push(`${row.sku || row.name}: ${err.message}`);
      }
    }

    res.json({ success: true, data: results });
  } catch (error) {
    next(error);
  }
};

// @route GET /api/products/bulk-export
export const bulkExportProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ isArchived: false }).populate("category", "name").lean();

    const rows = products.map((p) => ({
      name: p.name,
      sku: p.sku,
      barcode: p.barcode || "",
      category: p.category?.name || "",
      price: p.price,
      cost: p.cost,
      stock: p.stock,
    }));

    const parser = new CsvParser({ fields: ["name", "sku", "barcode", "category", "price", "cost", "stock"] });
    const csv = parser.parse(rows);

    res.header("Content-Type", "text/csv");
    res.attachment(`products-export-${Date.now()}.csv`);
    res.send(csv);
  } catch (error) {
    next(error);
  }
};