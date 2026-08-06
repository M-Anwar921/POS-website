import Category from "../models/Category.js";

export const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({ isActive: true }).populate("parent", "name").sort("name");

    // Build nested tree for convenience; flat list still included
    const tree = categories
      .filter((c) => !c.parent)
      .map((parent) => ({
        ...parent.toObject(),
        children: categories.filter((c) => c.parent?._id?.toString() === parent._id.toString()),
      }));

    res.json({ success: true, data: categories, tree });
  } catch (error) {
    next(error);
  }
};

export const createCategory = async (req, res, next) => {
  try {
    const category = await Category.create(req.body);
    res.status(201).json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!category) return res.status(404).json({ success: false, message: "Category not found" });
    res.json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (req, res, next) => {
  try {
    const hasChildren = await Category.exists({ parent: req.params.id, isActive: true });
    if (hasChildren) {
      return res.status(400).json({ success: false, message: "Cannot delete a category that has subcategories" });
    }
    const category = await Category.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!category) return res.status(404).json({ success: false, message: "Category not found" });
    res.json({ success: true, message: "Category deleted" });
  } catch (error) {
    next(error);
  }
};