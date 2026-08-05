import Customer from "../models/Customer.js";

export const getCustomers = async (req, res, next) => {
  try {
    const { search = "" } = req.query;
    const filter = search
      ? { $or: [{ name: { $regex: search, $options: "i" } }, { phone: { $regex: search, $options: "i" } }] }
      : {};
    const customers = await Customer.find(filter).sort("name").limit(50);
    res.json({ success: true, data: customers });
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