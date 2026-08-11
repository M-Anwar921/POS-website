import SalaryPayment from "../models/SalaryPayment.js";
import { logActivity } from "../utils/logActivity.js";

export const getSalaryPayments = async (req, res, next) => {
  try {
    const { employee } = req.query;
    const filter = employee ? { employee } : {};
    const payments = await SalaryPayment.find(filter)
      .populate({ path: "employee", populate: { path: "user", select: "name" } })
      .populate("paidBy", "name")
      .sort("-year -month");
    res.json({ success: true, data: payments });
  } catch (error) {
    next(error);
  }
};

export const createSalaryPayment = async (req, res, next) => {
  try {
    const payment = await SalaryPayment.create({ ...req.body, paidBy: req.user._id });
    await logActivity(req.user._id, "paid salary", "Employees", `Rs ${payment.amount} for ${payment.month}/${payment.year}`);
    res.status(201).json({ success: true, data: payment });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: "Salary for this month has already been paid" });
    }
    next(error);
  }
};