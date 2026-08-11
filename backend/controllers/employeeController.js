import Employee from "../models/Employee.js";
import User from "../models/User.js";
import Order from "../models/Order.js";
import { logActivity } from "../utils/logActivity.js";

const generateEmployeeId = async () => {
  const count = await Employee.countDocuments();
  return `EMP-${String(count + 1).padStart(4, "0")}`;
};

export const getEmployees = async (req, res, next) => {
  try {
    const employees = await Employee.find().populate("user", "name email role avatar isActive").sort("-createdAt");
    res.json({ success: true, data: employees });
  } catch (error) {
    next(error);
  }
};

export const getEmployee = async (req, res, next) => {
  try {
    const employee = await Employee.findById(req.params.id).populate("user", "name email role avatar isActive");
    if (!employee) return res.status(404).json({ success: false, message: "Employee not found" });
    res.json({ success: true, data: employee });
  } catch (error) {
    next(error);
  }
};

// @route POST /api/employees  -> creates User + Employee profile together
// body: { name, email, password, role, department, position, baseSalary }
export const createEmployee = async (req, res, next) => {
  try {
    const { name, email, password, role, department, position, baseSalary } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ success: false, message: "A user with this email already exists" });

    const user = await User.create({ name, email, password, role });
    const employee = await Employee.create({
      user: user._id,
      employeeId: await generateEmployeeId(),
      department, position, baseSalary,
    });

    await logActivity(req.user._id, "created employee", "Employees", `${name} (${role})`);

    res.status(201).json({ success: true, data: employee });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateEmployee = async (req, res, next) => {
  try {
    const { department, position, baseSalary, status } = req.body;
    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      { department, position, baseSalary, status },
      { new: true, runValidators: true }
    ).populate("user", "name email role");
    if (!employee) return res.status(404).json({ success: false, message: "Employee not found" });

    await logActivity(req.user._id, "updated employee", "Employees", employee.user.name);

    res.json({ success: true, data: employee });
  } catch (error) {
    next(error);
  }
};

// @route GET /api/employees/:id/performance?month=&year=
export const getPerformance = async (req, res, next) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ success: false, message: "Employee not found" });

    const now = new Date();
    const month = Number(req.query.month) || now.getMonth() + 1;
    const year = Number(req.query.year) || now.getFullYear();
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 1);

    const orders = await Order.find({
      cashier: employee.user,
      status: "completed",
      createdAt: { $gte: start, $lt: end },
    });

    const totalSales = orders.reduce((sum, o) => sum + o.grandTotal, 0);
    const orderCount = orders.length;
    const avgOrderValue = orderCount > 0 ? totalSales / orderCount : 0;

    res.json({ success: true, data: { totalSales, orderCount, avgOrderValue, month, year } });
  } catch (error) {
    next(error);
  }
};