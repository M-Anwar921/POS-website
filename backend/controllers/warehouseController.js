import Warehouse from "../models/Warehouse.js";

export const getWarehouses = async (req, res, next) => {
  try {
    const warehouses = await Warehouse.find({ isActive: true }).sort("name");
    res.json({ success: true, data: warehouses });
  } catch (error) {
    next(error);
  }
};

export const createWarehouse = async (req, res, next) => {
  try {
    const warehouse = await Warehouse.create(req.body);
    res.status(201).json({ success: true, data: warehouse });
  } catch (error) {
    next(error);
  }
};

export const updateWarehouse = async (req, res, next) => {
  try {
    const warehouse = await Warehouse.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!warehouse) return res.status(404).json({ success: false, message: "Warehouse not found" });
    res.json({ success: true, data: warehouse });
  } catch (error) {
    next(error);
  }
};

export const deleteWarehouse = async (req, res, next) => {
  try {
    const warehouse = await Warehouse.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!warehouse) return res.status(404).json({ success: false, message: "Warehouse not found" });
    res.json({ success: true, message: "Warehouse deactivated" });
  } catch (error) {
    next(error);
  }
};