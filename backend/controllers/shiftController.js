import Shift from "../models/Shift.js";

export const getShifts = async (req, res, next) => {
  try {
    const { employee, start, end } = req.query;
    const filter = {};
    if (employee) filter.employee = employee;
    if (start && end) filter.date = { $gte: new Date(start), $lte: new Date(end) };

    const shifts = await Shift.find(filter).populate({ path: "employee", populate: { path: "user", select: "name" } }).sort("date");
    res.json({ success: true, data: shifts });
  } catch (error) {
    next(error);
  }
};

export const createShift = async (req, res, next) => {
  try {
    const shift = await Shift.create(req.body);
    res.status(201).json({ success: true, data: shift });
  } catch (error) {
    next(error);
  }
};

export const updateShift = async (req, res, next) => {
  try {
    const shift = await Shift.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!shift) return res.status(404).json({ success: false, message: "Shift not found" });
    res.json({ success: true, data: shift });
  } catch (error) {
    next(error);
  }
};

export const deleteShift = async (req, res, next) => {
  try {
    await Shift.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Shift removed" });
  } catch (error) {
    next(error);
  }
};