import Supplier from "../models/Supplier.js";
import SupplierInvoice from "../models/SupplierInvoice.js";
import SupplierPayment from "../models/SupplierPayment.js";

export const getSuppliers = async (req, res, next) => {
  try {
    const { search = "" } = req.query;
    const filter = { isActive: true };
    if (search) filter.name = { $regex: search, $options: "i" };

    const suppliers = await Supplier.find(filter).sort("name");

    const withBalance = await Promise.all(
      suppliers.map(async (s) => {
        const invoices = await SupplierInvoice.find({ supplier: s._id });
        const outstandingBalance = invoices.reduce((sum, inv) => sum + (inv.amount - inv.amountPaid), 0);
        return { ...s.toObject(), outstandingBalance };
      })
    );

    res.json({ success: true, data: withBalance });
  } catch (error) {
    next(error);
  }
};

export const getSupplier = async (req, res, next) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) return res.status(404).json({ success: false, message: "Supplier not found" });

    const invoices = await SupplierInvoice.find({ supplier: supplier._id }).sort("-createdAt");
    const payments = await SupplierPayment.find({ supplier: supplier._id }).populate("invoice", "invoiceNumber").sort("-date");
    const outstandingBalance = invoices.reduce((sum, inv) => sum + (inv.amount - inv.amountPaid), 0);

    res.json({ success: true, data: { ...supplier.toObject(), invoices, payments, outstandingBalance } });
  } catch (error) {
    next(error);
  }
};

export const createSupplier = async (req, res, next) => {
  try {
    const supplier = await Supplier.create(req.body);
    res.status(201).json({ success: true, data: supplier });
  } catch (error) {
    next(error);
  }
};

export const updateSupplier = async (req, res, next) => {
  try {
    const supplier = await Supplier.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!supplier) return res.status(404).json({ success: false, message: "Supplier not found" });
    res.json({ success: true, data: supplier });
  } catch (error) {
    next(error);
  }
};

export const deleteSupplier = async (req, res, next) => {
  try {
    const supplier = await Supplier.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!supplier) return res.status(404).json({ success: false, message: "Supplier not found" });
    res.json({ success: true, message: "Supplier deleted" });
  } catch (error) {
    next(error);
  }
};

// @route POST /api/suppliers/:id/invoices
export const createInvoice = async (req, res, next) => {
  try {
    const invoice = await SupplierInvoice.create({ ...req.body, supplier: req.params.id });
    res.status(201).json({ success: true, data: invoice });
  } catch (error) {
    next(error);
  }
};

// @route POST /api/suppliers/:id/payments
// body: { invoice, amount, method, notes }
export const recordPayment = async (req, res, next) => {
  try {
    const { invoice: invoiceId, amount, method, notes } = req.body;

    const invoice = await SupplierInvoice.findById(invoiceId);
    if (!invoice) return res.status(404).json({ success: false, message: "Invoice not found" });

    const remaining = invoice.amount - invoice.amountPaid;
    if (amount > remaining) {
      return res.status(400).json({ success: false, message: `Payment exceeds remaining balance of ${remaining}` });
    }

    invoice.amountPaid += Number(amount);
    await invoice.save();

    const payment = await SupplierPayment.create({
      supplier: req.params.id, invoice: invoiceId, amount, method, notes,
    });

    res.status(201).json({ success: true, data: { payment, invoice } });
  } catch (error) {
    next(error);
  }
};