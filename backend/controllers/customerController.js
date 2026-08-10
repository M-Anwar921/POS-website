import Customer from "../models/Customer.js";
import Order from "../models/Order.js";

export const getCustomers = async (req, res, next) => {
  try {
    const { search = "" } = req.query;
    const filter = search
      ? { $or: [{ name: { $regex: search, $options: "i" } }, { phone: { $regex: search, $options: "i" } }] }
      : {};
    const customers = await Customer.find(filter).sort("name").limit(100);
    res.json({ success: true, data: customers });
  } catch (error) {
    next(error);
  }
};

// @route GET /api/customers/:id  -> profile + purchase history
export const getCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).json({ success: false, message: "Customer not found" });

    const orders = await Order.find({ customer: customer._id, status: { $ne: "held" } })
      .sort("-createdAt")
      .limit(50);

    const totalSpent = orders
      .filter((o) => o.status === "completed" || o.status === "partially_refunded")
      .reduce((sum, o) => sum + o.grandTotal, 0);

    res.json({ success: true, data: { ...customer.toObject(), orders, totalSpent, orderCount: orders.length } });
  } catch (error) {
    next(error);
  }
};

export const createCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.create(req.body);
    res.status(201).json({ success: true, data: customer });
  } catch (error) {
    next(error);
  }
};

export const updateCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!customer) return res.status(404).json({ success: false, message: "Customer not found" });
    res.json({ success: true, data: customer });
  } catch (error) {
    next(error);
  }
};

// @route POST /api/customers/:id/loyalty
// body: { points, note }  -- points can be negative to redeem
export const adjustLoyaltyPoints = async (req, res, next) => {
  try {
    const { points } = req.body;
    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).json({ success: false, message: "Customer not found" });

    const newTotal = customer.loyaltyPoints + Number(points);
    if (newTotal < 0) return res.status(400).json({ success: false, message: "Loyalty points cannot go negative" });

    customer.loyaltyPoints = newTotal;
    await customer.save();

    res.json({ success: true, data: customer });
  } catch (error) {
    next(error);
  }
};

// @route POST /api/customers/:id/credit
// body: { amount, type: "charge"|"payment", note }
// "charge" increases what customer owes; "payment" reduces it
export const adjustCreditBalance = async (req, res, next) => {
  try {
    const { amount, type } = req.body;
    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).json({ success: false, message: "Customer not found" });

    const delta = type === "payment" ? -Math.abs(amount) : Math.abs(amount);
    const newBalance = customer.creditBalance + delta;
    if (newBalance < 0) return res.status(400).json({ success: false, message: "Payment exceeds outstanding balance" });

    customer.creditBalance = newBalance;
    await customer.save();

    res.json({ success: true, data: customer });
  } catch (error) {
    next(error);
  }
};

export const deleteCustomer = async (req, res, next) => {
  try {
    await Customer.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Customer deleted" });
  } catch (error) {
    next(error);
  }
};