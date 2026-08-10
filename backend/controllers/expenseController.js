import Expense from "../models/Expense.js";

export const getExpenses = async (req, res, next) => {
  try {
    const { category, month, year, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (category) filter.category = category;
    if (month && year) {
      const start = new Date(Number(year), Number(month) - 1, 1);
      const end = new Date(Number(year), Number(month), 1);
      filter.date = { $gte: start, $lt: end };
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [expenses, total] = await Promise.all([
      Expense.find(filter).populate("createdBy", "name").sort("-date").skip(skip).limit(Number(limit)),
      Expense.countDocuments(filter),
    ]);

    res.json({ success: true, data: expenses, pagination: { total, page: Number(page), pages: Math.ceil(total / limit) } });
  } catch (error) {
    next(error);
  }
};

export const createExpense = async (req, res, next) => {
  try {
    const expense = await Expense.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json({ success: true, data: expense });
  } catch (error) {
    next(error);
  }
};

export const updateExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!expense) return res.status(404).json({ success: false, message: "Expense not found" });
    res.json({ success: true, data: expense });
  } catch (error) {
    next(error);
  }
};

export const deleteExpense = async (req, res, next) => {
  try {
    await Expense.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Expense deleted" });
  } catch (error) {
    next(error);
  }
};

// @route GET /api/expenses/report?month=&year=
export const getMonthlyReport = async (req, res, next) => {
  try {
    const now = new Date();
    const month = Number(req.query.month) || now.getMonth() + 1;
    const year = Number(req.query.year) || now.getFullYear();

    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 1);

    const expenses = await Expense.find({ date: { $gte: start, $lt: end } });

    const byCategory = {};
    let total = 0;
    for (const e of expenses) {
      const key = e.category === "Other" && e.customCategory ? e.customCategory : e.category;
      byCategory[key] = (byCategory[key] || 0) + e.amount;
      total += e.amount;
    }

    res.json({
      success: true,
      data: {
        month, year, total,
        byCategory: Object.entries(byCategory).map(([category, amount]) => ({ category, amount })),
        count: expenses.length,
      },
    });
  } catch (error) {
    next(error);
  }
};