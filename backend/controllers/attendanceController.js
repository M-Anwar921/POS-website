import Attendance from "../models/Attendance.js";
import Employee from "../models/Employee.js";

const todayDateOnly = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

// @route GET /api/attendance?employee=&month=&year=
export const getAttendance = async (req, res, next) => {
  try {
    const { employee, month, year } = req.query;
    const filter = {};
    if (employee) filter.employee = employee;
    if (month && year) {
      const start = new Date(Number(year), Number(month) - 1, 1);
      const end = new Date(Number(year), Number(month), 1);
      filter.date = { $gte: start, $lt: end };
    }
    const records = await Attendance.find(filter).populate({ path: "employee", populate: { path: "user", select: "name" } }).sort("-date");
    res.json({ success: true, data: records });
  } catch (error) {
    next(error);
  }
};

// @route POST /api/attendance/checkin  body: { employee }
export const checkIn = async (req, res, next) => {
  try {
    const { employee } = req.body;
    const date = todayDateOnly();

    let record = await Attendance.findOne({ employee, date });
    if (record?.checkIn) return res.status(400).json({ success: false, message: "Already checked in today" });

    if (!record) {
      record = await Attendance.create({ employee, date, checkIn: new Date(), status: "present" });
    } else {
      record.checkIn = new Date();
      record.status = "present";
      await record.save();
    }

    res.json({ success: true, data: record });
  } catch (error) {
    next(error);
  }
};

// @route POST /api/attendance/checkout  body: { employee }
export const checkOut = async (req, res, next) => {
  try {
    const { employee } = req.body;
    const date = todayDateOnly();

    const record = await Attendance.findOne({ employee, date });
    if (!record || !record.checkIn) return res.status(400).json({ success: false, message: "Must check in before checking out" });
    if (record.checkOut) return res.status(400).json({ success: false, message: "Already checked out today" });

    record.checkOut = new Date();
    await record.save();

    res.json({ success: true, data: record });
  } catch (error) {
    next(error);
  }
};

// @route POST /api/attendance/mark  body: { employee, date, status, notes }  (manual entry, e.g. leave/absent)
export const markAttendance = async (req, res, next) => {
  try {
    const { employee, date, status, notes = "" } = req.body;
    const dateOnly = new Date(date);
    dateOnly.setHours(0, 0, 0, 0);

    const record = await Attendance.findOneAndUpdate(
      { employee, date: dateOnly },
      { status, notes },
      { new: true, upsert: true }
    );

    res.json({ success: true, data: record });
  } catch (error) {
    next(error);
  }
};